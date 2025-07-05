/**
 * Geometric types for the Melete graphics library
 */

// Basic geometric types - support 2D and 3D
export interface Pt {
  x: number;
  y: number;
  z?: number;
}

export interface Vec {
  dx: number;
  dy: number;
  dz?: number;
}

export interface Size {
  width: number;
  height: number;
}

// Axis-aligned bounding box type
export interface AABB {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

// Ray definition - a point and direction vector
export interface Ray {
  origin: Pt;
  direction: Vec;
}

// Line segment definition - two distinct points
export interface LineSeg {
  start: Pt;
  end: Pt;
}

// Quadratic Bezier curve definition
export interface BezierQuad {
  start: Pt;
  control: Pt;
  end: Pt;
}

// Cubic Bezier curve definition (for future use)
export interface BezierCubic {
  start: Pt;
  control1: Pt;
  control2: Pt;
  end: Pt;
}

// Drawing method parameter interfaces - geometry only
export interface DrawRectParams {
  topLeft: Pt;
  size: Size;
}

export interface DrawCircleParams {
  center: Pt;
  radius: number;
}

export interface DrawTextParams {
  text: string;
  position: Pt;
}

export interface DrawLineParams {
  from: Pt;
  to: Pt;
}

export interface DrawRoundedRectParams {
  bounds: AABB;
  radius: number;
}

export interface DrawCurvedEdgeParams {
  bezier: BezierQuad;
}

export interface DrawArrowheadParams {
  ray: Ray;
  arrowStyle: 'v' | 'triangle';
  size: { width: number; length: number };
}

export interface DrawPolygonParams {
  points: Pt[];
}

export interface DrawTriangleParams {
  p1: Pt;
  p2: Pt;
  p3: Pt;
}
