/**
 * Hit testing utilities for the Melete graphics library
 * Provides AABB calculation and precise hit testing for all drawing primitives
 */

import { AABB, Pt } from './geom';

// AABB calculation functions for all drawing primitives

export const calculateAabbFromCircle = (center: Pt, radius: number): AABB => ({
  minX: center.x - radius,
  maxX: center.x + radius,
  minY: center.y - radius,
  maxY: center.y + radius,
});

export const calculateAabbFromRect = (
  topLeft: Pt,
  width: number,
  height: number
): AABB => ({
  minX: topLeft.x,
  maxX: topLeft.x + width,
  minY: topLeft.y,
  maxY: topLeft.y + height,
});

export const calculateAabbFromRoundedRect = (bounds: AABB): AABB => bounds;

export const calculateAabbFromPoints = (points: Pt[]): AABB => {
  if (points.length === 0) {
    return { minX: 0, maxX: 0, minY: 0, maxY: 0 };
  }

  const xs = points.map(p => p.x);
  const ys = points.map(p => p.y);

  return {
    minX: Math.min(...xs),
    maxX: Math.max(...xs),
    minY: Math.min(...ys),
    maxY: Math.max(...ys),
  };
};

export const calculateAabbFromLine = (from: Pt, to: Pt): AABB =>
  calculateAabbFromPoints([from, to]);

export const calculateAabbFromTriangle = (p1: Pt, p2: Pt, p3: Pt): AABB =>
  calculateAabbFromPoints([p1, p2, p3]);

export const calculateAabbFromPolygon = (points: Pt[]): AABB =>
  calculateAabbFromPoints(points);

export const calculateAabbFromText = (
  ctx: CanvasRenderingContext2D,
  text: string,
  position: Pt,
  font?: string
): AABB => {
  const originalFont = ctx.font;
  if (font) {
    ctx.font = font;
  }

  const metrics = ctx.measureText(text);
  const ascent =
    metrics.actualBoundingBoxAscent || metrics.fontBoundingBoxAscent || 10;
  const descent =
    metrics.actualBoundingBoxDescent || metrics.fontBoundingBoxDescent || 2;

  if (font) {
    ctx.font = originalFont;
  }

  return {
    minX: position.x,
    maxX: position.x + metrics.width,
    minY: position.y - ascent,
    maxY: position.y + descent,
  };
};

// Point-in-shape testing functions

export const pointInAABB = (point: Pt, aabb: AABB): boolean =>
  point.x >= aabb.minX &&
  point.x <= aabb.maxX &&
  point.y >= aabb.minY &&
  point.y <= aabb.maxY;

export const pointInCircle = (
  point: Pt,
  center: Pt,
  radius: number
): boolean => {
  const dx = point.x - center.x;
  const dy = point.y - center.y;
  return dx * dx + dy * dy <= radius * radius;
};

export const pointInRect = (
  point: Pt,
  topLeft: Pt,
  width: number,
  height: number
): boolean =>
  point.x >= topLeft.x &&
  point.x <= topLeft.x + width &&
  point.y >= topLeft.y &&
  point.y <= topLeft.y + height;

export const pointInRoundedRect = (
  point: Pt,
  bounds: AABB,
  _radius: number
): boolean => {
  // For now, use simple rectangle test - could be enhanced for precise rounded corner testing
  return pointInAABB(point, bounds);
};

export const pointInTriangle = (point: Pt, p1: Pt, p2: Pt, p3: Pt): boolean => {
  // Use barycentric coordinates
  const denom = (p2.y - p3.y) * (p1.x - p3.x) + (p3.x - p2.x) * (p1.y - p3.y);
  if (Math.abs(denom) < 1e-10) return false;

  const a =
    ((p2.y - p3.y) * (point.x - p3.x) + (p3.x - p2.x) * (point.y - p3.y)) /
    denom;
  const b =
    ((p3.y - p1.y) * (point.x - p3.x) + (p1.x - p3.x) * (point.y - p3.y)) /
    denom;
  const c = 1 - a - b;

  return a >= 0 && b >= 0 && c >= 0;
};

export const pointInPolygon = (point: Pt, points: Pt[]): boolean => {
  if (points.length < 3) return false;

  // Ray casting algorithm TODO: I think this might be a horizontal even/odd
  // winding raycast but the boolean expression is a bit cryptic. Either way, we
  // should have horizontal and vertical raycast routines in the geom group.
  let inside = false;
  const { x, y } = point;

  for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
    const xi = points[i].x;
    const yi = points[i].y;
    const xj = points[j].x;
    const yj = points[j].y;

    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
  }

  return inside;
};

export const pointNearLine = (
  point: Pt,
  from: Pt,
  to: Pt,
  tolerance: number = 5
): boolean => {
  // Calculate distance from point to line segment
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const length = Math.sqrt(dx * dx + dy * dy);

  if (length === 0) {
    // Line is actually a point
    const distToPoint = Math.sqrt(
      (point.x - from.x) ** 2 + (point.y - from.y) ** 2
    );
    return distToPoint <= tolerance;
  }

  // Calculate closest point on line segment
  // TODO: closest point on line segment should be a function in the geom group
  const t = Math.max(
    0,
    Math.min(
      1,
      ((point.x - from.x) * dx + (point.y - from.y) * dy) / (length * length)
    )
  );
  const closestX = from.x + t * dx;
  const closestY = from.y + t * dy;

  // Calculate distance to closest point
  // TODO point/point distance should also be a function in the geom group
  const distance = Math.sqrt(
    (point.x - closestX) ** 2 + (point.y - closestY) ** 2
  );
  return distance <= tolerance;
};

// Hit test data structure
export interface HitTestData {
  id: string;
  aabb: AABB;
  preciseTest: (point: Pt) => boolean;
}

// Hit test registry for managing multiple hit testable objects
export class HitTestRegistry {
  private objects: HitTestData[] = [];

  add(data: HitTestData): void {
    this.objects.push(data);
  }

  remove(id: string): void {
    this.objects = this.objects.filter(obj => obj.id !== id);
  }

  clear(): void {
    this.objects = [];
  }

  findObjectsAt(point: Pt): HitTestData[] {
    // Phase 1: Fast AABB elimination
    const candidates = this.objects.filter(obj => pointInAABB(point, obj.aabb));

    // Phase 2: Precise hit testing
    return candidates.filter(obj => obj.preciseTest(point));
  }

  findFirstObjectAt(point: Pt): HitTestData | null {
    const hits = this.findObjectsAt(point);
    return hits.length > 0 ? hits[0] : null;
  }
}
