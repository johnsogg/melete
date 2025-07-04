import { Pt } from '../types';

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

// Calculate intersection point between line and rectangle
export const getBoxEdgeIntersection = (
  lineStart: Pt,
  lineEnd: Pt,
  boxCenter: Pt,
  boxWidth: number,
  boxHeight: number
): Pt => {
  const dx = lineEnd.x - lineStart.x;
  const dy = lineEnd.y - lineStart.y;

  const halfWidth = boxWidth / 2;
  const halfHeight = boxHeight / 2;

  // Calculate intersection with each edge of the box
  const intersections: Pt[] = [];

  // Top edge
  if (dy !== 0) {
    const t = (boxCenter.y - halfHeight - lineStart.y) / dy;
    if (t >= 0 && t <= 1) {
      const x = lineStart.x + t * dx;
      if (x >= boxCenter.x - halfWidth && x <= boxCenter.x + halfWidth) {
        intersections.push({ x, y: boxCenter.y - halfHeight });
      }
    }
  }

  // Bottom edge
  if (dy !== 0) {
    const t = (boxCenter.y + halfHeight - lineStart.y) / dy;
    if (t >= 0 && t <= 1) {
      const x = lineStart.x + t * dx;
      if (x >= boxCenter.x - halfWidth && x <= boxCenter.x + halfWidth) {
        intersections.push({ x, y: boxCenter.y + halfHeight });
      }
    }
  }

  // Left edge
  if (dx !== 0) {
    const t = (boxCenter.x - halfWidth - lineStart.x) / dx;
    if (t >= 0 && t <= 1) {
      const y = lineStart.y + t * dy;
      if (y >= boxCenter.y - halfHeight && y <= boxCenter.y + halfHeight) {
        intersections.push({ x: boxCenter.x - halfWidth, y });
      }
    }
  }

  // Right edge
  if (dx !== 0) {
    const t = (boxCenter.x + halfWidth - lineStart.x) / dx;
    if (t >= 0 && t <= 1) {
      const y = lineStart.y + t * dy;
      if (y >= boxCenter.y - halfHeight && y <= boxCenter.y + halfHeight) {
        intersections.push({ x: boxCenter.x + halfWidth, y });
      }
    }
  }

  // Return the closest intersection to the line end
  if (intersections.length === 0) {
    return boxCenter; // Fallback to center if no intersection found
  }

  return intersections.reduce((closest, current) => {
    const closestDist = Math.sqrt(
      Math.pow(closest.x - lineEnd.x, 2) + Math.pow(closest.y - lineEnd.y, 2)
    );
    const currentDist = Math.sqrt(
      Math.pow(current.x - lineEnd.x, 2) + Math.pow(current.y - lineEnd.y, 2)
    );
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

  const discriminant = b * b - 4 * a * c;
  if (discriminant < 0) return [];

  const sqrtD = Math.sqrt(discriminant);
  return [(-b - sqrtD) / (2 * a), (-b + sqrtD) / (2 * a)];
};

// Find intersection between quadratic Bezier curve and horizontal line
export const intersectBezierWithHorizontalLine = (
  start: Pt,
  control: Pt,
  end: Pt,
  y: number
): number[] => {
  // Bezier curve: B(t) = (1-t)²P₀ + 2t(1-t)P₁ + t²P₂
  // For y-coordinate: By(t) = (1-t)²y₀ + 2t(1-t)y₁ + t²y₂
  // Expand: By(t) = y₀ - 2y₀t + y₀t² + 2y₁t - 2y₁t² + y₂t²
  // Rearrange: By(t) = (y₀ - 2y₁ + y₂)t² + (-2y₀ + 2y₁)t + y₀

  const a = start.y - 2 * control.y + end.y;
  const b = -2 * start.y + 2 * control.y;
  const c = start.y - y;

  return solveQuadratic(a, b, c).filter(t => t >= 0 && t <= 1);
};

// Find intersection between quadratic Bezier curve and vertical line
export const intersectBezierWithVerticalLine = (
  start: Pt,
  control: Pt,
  end: Pt,
  x: number
): number[] => {
  // Same as horizontal, but for x-coordinate
  const a = start.x - 2 * control.x + end.x;
  const b = -2 * start.x + 2 * control.x;
  const c = start.x - x;

  return solveQuadratic(a, b, c).filter(t => t >= 0 && t <= 1);
};

// Find exact intersection between quadratic Bezier curve and rectangle
export const getBezierBoxIntersection = (
  start: Pt,
  control: Pt,
  end: Pt,
  boxCenter: Pt,
  boxWidth: number,
  boxHeight: number,
  fromStart: boolean = true
): Pt => {
  const halfWidth = boxWidth / 2;
  const halfHeight = boxHeight / 2;

  const intersections: { t: number; point: Pt }[] = [];

  // Top edge (y = boxCenter.y - halfHeight)
  const topTs = intersectBezierWithHorizontalLine(
    start,
    control,
    end,
    boxCenter.y - halfHeight
  );
  for (const t of topTs) {
    const point = getPointOnQuadraticBezier(start, control, end, t);
    if (
      point.x >= boxCenter.x - halfWidth &&
      point.x <= boxCenter.x + halfWidth
    ) {
      intersections.push({ t, point });
    }
  }

  // Bottom edge (y = boxCenter.y + halfHeight)
  const bottomTs = intersectBezierWithHorizontalLine(
    start,
    control,
    end,
    boxCenter.y + halfHeight
  );
  for (const t of bottomTs) {
    const point = getPointOnQuadraticBezier(start, control, end, t);
    if (
      point.x >= boxCenter.x - halfWidth &&
      point.x <= boxCenter.x + halfWidth
    ) {
      intersections.push({ t, point });
    }
  }

  // Left edge (x = boxCenter.x - halfWidth)
  const leftTs = intersectBezierWithVerticalLine(
    start,
    control,
    end,
    boxCenter.x - halfWidth
  );
  for (const t of leftTs) {
    const point = getPointOnQuadraticBezier(start, control, end, t);
    if (
      point.y >= boxCenter.y - halfHeight &&
      point.y <= boxCenter.y + halfHeight
    ) {
      intersections.push({ t, point });
    }
  }

  // Right edge (x = boxCenter.x + halfWidth)
  const rightTs = intersectBezierWithVerticalLine(
    start,
    control,
    end,
    boxCenter.x + halfWidth
  );
  for (const t of rightTs) {
    const point = getPointOnQuadraticBezier(start, control, end, t);
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
  start: Pt,
  end: Pt,
  curvature: number = 0.3
): Pt => {
  const midX = (start.x + end.x) / 2;
  const midY = (start.y + end.y) / 2;

  // Calculate perpendicular vector (rotated 90 degrees to the right)
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const perpX = dy; // 90 degree rotation: (x,y) -> (y,-x)
  const perpY = -dx;

  // Normalize perpendicular vector
  const length = Math.sqrt(perpX * perpX + perpY * perpY);
  if (length === 0) return { x: midX, y: midY };

  const normalizedPerpX = perpX / length;
  const normalizedPerpY = perpY / length;

  // Calculate control point offset
  const offset = length * curvature;

  return {
    x: midX + normalizedPerpX * offset,
    y: midY + normalizedPerpY * offset,
  };
};

// Calculate point on quadratic Bezier curve at parameter t (0 to 1)
export const getPointOnQuadraticBezier = (
  start: Pt,
  control: Pt,
  end: Pt,
  t: number
): Pt => {
  const u = 1 - t;
  return {
    x: u * u * start.x + 2 * u * t * control.x + t * t * end.x,
    y: u * u * start.y + 2 * u * t * control.y + t * t * end.y,
  };
};

// Calculate tangent direction at end of quadratic Bezier curve
export const getTangentAtQuadraticBezierEnd = (control: Pt, end: Pt): Pt => {
  // Tangent at t=1 is 2(end - control)
  const tangentX = 2 * (end.x - control.x);
  const tangentY = 2 * (end.y - control.y);

  // Normalize
  const length = Math.sqrt(tangentX * tangentX + tangentY * tangentY);
  if (length === 0) return { x: 1, y: 0 };

  return {
    x: tangentX / length,
    y: tangentY / length,
  };
};
