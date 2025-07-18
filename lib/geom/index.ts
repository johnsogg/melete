import { Pt, Vec, Size, AABB, Ray, LineSeg, BezierQuad } from './types';

// Vector utility functions
export const midpoint = (p1: Pt, p2: Pt): Pt => ({
  x: (p1.x + p2.x) / 2,
  y: (p1.y + p2.y) / 2,
});

export const direction = (from: Pt, to: Pt): Vec => ({
  dx: to.x - from.x,
  dy: to.y - from.y,
});

export const perpendicular = (vec: Vec): Vec => ({
  dx: vec.dy,
  dy: -vec.dx,
});

export const magnitude = (vec: Vec): number =>
  Math.sqrt(vec.dx * vec.dx + vec.dy * vec.dy);

export const normalize = (vec: Vec): Vec => {
  const mag = magnitude(vec);
  if (mag === 0) return { dx: 0, dy: 0 };
  return { dx: vec.dx / mag, dy: vec.dy / mag };
};

// Additional mathematical utilities
export const dotProduct = (v1: Vec, v2: Vec): number =>
  v1.dx * v2.dx + v1.dy * v2.dy;

export const distanceBetweenPoints = (p1: Pt, p2: Pt): number =>
  magnitude(direction(p1, p2));

export const distanceSquared = (p1: Pt, p2: Pt): number => {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return dx * dx + dy * dy;
};

export const clamp = (value: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, value));

/**
 * Calculate the perpendicular distance from a point to a line defined by two points
 * Returns positive distance, or Infinity for degenerate lines
 */
export const distancePointToLine = (
  point: Pt,
  lineStart: Pt,
  lineEnd: Pt
): number => {
  const lineLength = magnitude(direction(lineStart, lineEnd));

  // Handle degenerate line case
  if (lineLength < 1e-10) {
    return Infinity;
  }

  // Calculate perpendicular distance using line equation ax + by + c = 0
  const A = lineEnd.y - lineStart.y;
  const B = lineStart.x - lineEnd.x;
  const C = lineEnd.x * lineStart.y - lineStart.x * lineEnd.y;

  return Math.abs(A * point.x + B * point.y + C) / Math.sqrt(A * A + B * B);
};

/**
 * Calculate the angle between two lines in radians
 * Returns the acute angle (0 to π/2)
 */
export const angleBetweenLines = (
  line1Start: Pt,
  line1End: Pt,
  line2Start: Pt,
  line2End: Pt
): number => {
  // Calculate direction vectors
  const vec1 = direction(line1Start, line1End);
  const vec2 = direction(line2Start, line2End);

  // Calculate magnitudes
  const mag1 = magnitude(vec1);
  const mag2 = magnitude(vec2);

  // Handle degenerate cases
  if (mag1 < 1e-10 || mag2 < 1e-10) {
    return NaN;
  }

  // Normalize vectors
  const norm1 = normalize(vec1);
  const norm2 = normalize(vec2);

  // Calculate dot product (cosine of angle)
  const dotProd = dotProduct(norm1, norm2);

  // Clamp to valid range for acos (handle floating point precision issues)
  const clampedDot = clamp(dotProd, -1, 1);

  // Return acute angle (take absolute value of dot product to get acute angle)
  return Math.acos(Math.abs(clampedDot));
};

// Re-export types for convenience
export type {
  Pt,
  Vec,
  Size,
  AABB,
  Ray,
  LineSeg,
  BezierQuad,
  BezierCubic,
} from './types';

// Axis-aligned edge definition for intersection calculations
type AAEdge = {
  edgePosition: number;
  edgeAxis: 'x' | 'y';
  boundMin: number;
  boundMax: number;
};

// Create AABB from center point and dimensions
const makeAABB = (center: Pt, width: number, height: number): AABB => ({
  minX: center.x - width / 2,
  maxX: center.x + width / 2,
  minY: center.y - height / 2,
  maxY: center.y + height / 2,
});

// Get width and height of an AABB
export const getAABBSize = (aabb: AABB): Size => ({
  width: aabb.maxX - aabb.minX,
  height: aabb.maxY - aabb.minY,
});

// Get all four edges of an AABB
const getEdges = (aabb: AABB): AAEdge[] => [
  {
    edgePosition: aabb.minY,
    edgeAxis: 'y',
    boundMin: aabb.minX,
    boundMax: aabb.maxX,
  }, // Top
  {
    edgePosition: aabb.maxY,
    edgeAxis: 'y',
    boundMin: aabb.minX,
    boundMax: aabb.maxX,
  }, // Bottom
  {
    edgePosition: aabb.minX,
    edgeAxis: 'x',
    boundMin: aabb.minY,
    boundMax: aabb.maxY,
  }, // Left
  {
    edgePosition: aabb.maxX,
    edgeAxis: 'x',
    boundMin: aabb.minY,
    boundMax: aabb.maxY,
  }, // Right
];

// Helper function to find intersection between a ray and an axis-aligned edge
const findEdgeIntersection = (ray: Ray, edge: AAEdge): Pt[] => {
  const { edgePosition, edgeAxis, boundMin, boundMax } = edge;

  const isVerticalEdge = edgeAxis === 'x';
  const delta = isVerticalEdge ? ray.direction.dx : ray.direction.dy;
  const lineCoord = isVerticalEdge ? ray.origin.x : ray.origin.y;

  if (delta === 0) return [];

  const t = (edgePosition - lineCoord) / delta;
  if (t < 0 || t > 1) return [];

  const crossDelta = isVerticalEdge ? ray.direction.dy : ray.direction.dx;
  const lineCrossCoord = isVerticalEdge ? ray.origin.y : ray.origin.x;
  const crossCoord = lineCrossCoord + t * crossDelta;

  if (crossCoord < boundMin || crossCoord > boundMax) return [];

  const intersection = isVerticalEdge
    ? { x: edgePosition, y: crossCoord }
    : { x: crossCoord, y: edgePosition };

  return [intersection];
};

// Generate random position within canvas bounds with box margin
export const getRandomPosition = (): Pt => {
  const margin = 60; // Half box size plus padding
  const canvasWidth = 800;
  const canvasHeight = 600;

  return {
    x: margin + Math.random() * (canvasWidth - 2 * margin),
    y: margin + Math.random() * (canvasHeight - 2 * margin),
  };
};

// Calculate intersection point between line segment and rectangle
export const getBoxEdgeIntersection = (
  seg: LineSeg,
  boxCenter: Pt,
  boxWidth: number,
  boxHeight: number
): Pt => {
  const dir = direction(seg.start, seg.end);

  // Calculate intersection with each edge of the box
  const aabb = makeAABB(boxCenter, boxWidth, boxHeight);
  const ray: Ray = { origin: seg.start, direction: dir };

  const intersections: Pt[] = [];
  for (const edge of getEdges(aabb)) {
    intersections.push(...findEdgeIntersection(ray, edge));
  }

  // Return the closest intersection to the line end
  if (intersections.length === 0) {
    return boxCenter; // Fallback to center if no intersection found
  }

  return intersections.reduce((closest, current) => {
    const closestDist = magnitude(direction(closest, seg.end));
    const currentDist = magnitude(direction(current, seg.end));
    return currentDist < closestDist ? current : closest;
  });
};

// Solve quadratic equation ax² + bx + c = 0
export const solveQuadratic = (a: number, b: number, c: number): number[] => {
  if (Math.abs(a) < 1e-10) {
    // Linear equation: bx + c = 0
    if (Math.abs(b) < 1e-10) return [];
    return [-c / b];
  }
  // Dear Mr. Flater comma sir: the quadratic formula is implemented below. RIP.
  const discriminant = b * b - 4 * a * c;
  if (discriminant < 0) return [];

  const sqrtD = Math.sqrt(discriminant);
  return [(-b - sqrtD) / (2 * a), (-b + sqrtD) / (2 * a)];
};

// Find intersection between quadratic Bezier curve and horizontal line
export const intersectQuadBezierWithHorizontalLine = (
  bezier: BezierQuad,
  y: number
): number[] => {
  // Bezier curve: B(t) = (1-t)²P₀ + 2t(1-t)P₁ + t²P₂
  // For y-coordinate: By(t) = (1-t)²y₀ + 2t(1-t)y₁ + t²y₂
  // Expand: By(t) = y₀ - 2y₀t + y₀t² + 2y₁t - 2y₁t² + y₂t²
  // Rearrange: By(t) = (y₀ - 2y₁ + y₂)t² + (-2y₀ + 2y₁)t + y₀

  const a = bezier.start.y - 2 * bezier.control.y + bezier.end.y;
  const b = -2 * bezier.start.y + 2 * bezier.control.y;
  const c = bezier.start.y - y;

  return solveQuadratic(a, b, c).filter(t => t >= 0 && t <= 1);
};

// Find intersection between quadratic Bezier curve and vertical line
export const intersectQuadBezierWithVerticalLine = (
  bezier: BezierQuad,
  x: number
): number[] => {
  // Same as horizontal, but for x-coordinate
  const a = bezier.start.x - 2 * bezier.control.x + bezier.end.x;
  const b = -2 * bezier.start.x + 2 * bezier.control.x;
  const c = bezier.start.x - x;

  return solveQuadratic(a, b, c).filter(t => t >= 0 && t <= 1);
};

// Find exact intersection between quadratic Bezier curve and rectangle
export const getQuadBezierBoxIntersection = (
  bezier: BezierQuad,
  boxCenter: Pt,
  boxWidth: number,
  boxHeight: number,
  fromStart: boolean = true
): Pt => {
  const halfWidth = boxWidth / 2;
  const halfHeight = boxHeight / 2;

  const intersections: { t: number; point: Pt }[] = [];

  // Top edge (y = boxCenter.y - halfHeight)
  const topTs = intersectQuadBezierWithHorizontalLine(
    bezier,
    boxCenter.y - halfHeight
  );
  for (const t of topTs) {
    const point = getPointOnQuadBezier(bezier, t);
    if (
      point.x >= boxCenter.x - halfWidth &&
      point.x <= boxCenter.x + halfWidth
    ) {
      intersections.push({ t, point });
    }
  }

  // Bottom edge (y = boxCenter.y + halfHeight)
  const bottomTs = intersectQuadBezierWithHorizontalLine(
    bezier,
    boxCenter.y + halfHeight
  );
  for (const t of bottomTs) {
    const point = getPointOnQuadBezier(bezier, t);
    if (
      point.x >= boxCenter.x - halfWidth &&
      point.x <= boxCenter.x + halfWidth
    ) {
      intersections.push({ t, point });
    }
  }

  // Left edge (x = boxCenter.x - halfWidth)
  const leftTs = intersectQuadBezierWithVerticalLine(
    bezier,
    boxCenter.x - halfWidth
  );
  for (const t of leftTs) {
    const point = getPointOnQuadBezier(bezier, t);
    if (
      point.y >= boxCenter.y - halfHeight &&
      point.y <= boxCenter.y + halfHeight
    ) {
      intersections.push({ t, point });
    }
  }

  // Right edge (x = boxCenter.x + halfWidth)
  const rightTs = intersectQuadBezierWithVerticalLine(
    bezier,
    boxCenter.x + halfWidth
  );
  for (const t of rightTs) {
    const point = getPointOnQuadBezier(bezier, t);
    if (
      point.y >= boxCenter.y - halfHeight &&
      point.y <= boxCenter.y + halfHeight
    ) {
      intersections.push({ t, point });
    }
  }

  if (intersections.length === 0) {
    return boxCenter; // Fallback
  }

  // Sort by t parameter and return appropriate intersection
  intersections.sort((a, b) => a.t - b.t);

  if (fromStart) {
    // Find first intersection when coming from start (t > 0)
    const validIntersections = intersections.filter(i => i.t > 1e-6);
    return validIntersections.length > 0
      ? validIntersections[0].point
      : intersections[0].point;
  } else {
    // Find last intersection when going to end (t < 1)
    const validIntersections = intersections.filter(i => i.t < 1 - 1e-6);
    return validIntersections.length > 0
      ? validIntersections[validIntersections.length - 1].point
      : intersections[intersections.length - 1].point;
  }
};

// Calculate control point for curved edge (bends to the right)
export const calculateCurveControlPoint = (
  seg: LineSeg,
  curvature: number = 0.3
): Pt => {
  const mid = midpoint(seg.start, seg.end);
  const dir = direction(seg.start, seg.end);
  const perp = perpendicular(dir);
  const length = magnitude(dir);

  if (length === 0) return mid;

  const normalizedPerp = normalize(perp);
  const offset = length * curvature;

  return {
    x: mid.x + normalizedPerp.dx * offset,
    y: mid.y + normalizedPerp.dy * offset,
  };
};

// Calculate point on quadratic Bezier curve at parameter t (0 to 1)
export const getPointOnQuadBezier = (bezier: BezierQuad, t: number): Pt => {
  const u = 1 - t;
  return {
    x:
      u * u * bezier.start.x +
      2 * u * t * bezier.control.x +
      t * t * bezier.end.x,
    y:
      u * u * bezier.start.y +
      2 * u * t * bezier.control.y +
      t * t * bezier.end.y,
  };
};

// Calculate tangent direction at end of quadratic Bezier curve
export const getTangentAtQuadBezierEnd = (bezier: BezierQuad): Vec => {
  // Tangent at t=1 is 2(end - control)
  const tangentVec = {
    dx: 2 * (bezier.end.x - bezier.control.x),
    dy: 2 * (bezier.end.y - bezier.control.y),
  };

  // Normalize
  const length = magnitude(tangentVec);
  if (length === 0) return { dx: 1, dy: 0 };

  return normalize(tangentVec);
};
