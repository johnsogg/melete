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
  segType?: 'line';
  start: Pt;
  end: Pt;
}

// Quadratic Bezier curve definition
export interface BezierQuad {
  segType?: 'bezier-quad';
  start: Pt;
  control: Pt;
  end: Pt;
}

// Cubic Bezier curve definition (for future use)
export interface BezierCubic {
  segType?: 'bezier-cubic';
  start: Pt;
  control1: Pt;
  control2: Pt;
  end: Pt;
}

// Pose definition - semantic equivalent to Ray for positioning and orientation
export interface Pose {
  origin: Pt;
  direction: Vec;
}

// Circular arc segment definition - defined by three points on the arc
export interface CircleArcSeg {
  segType: 'circle-arc';
  start: Pt;
  control: Pt; // Point on the arc path between start and end
  end: Pt;
}

// Unified segment type using discriminated union
// Note: For constraint system usage, all segments should have segType defined
export type Segment = LineSeg | CircleArcSeg | BezierQuad | BezierCubic;

// Segment sequence - ordered collection of connected segments
// Use isSegmentSequenceClosed() from constraints/utils.ts to check if closed
export interface SegmentSequence {
  segments: Segment[];
}

// Closed geometric forms - either closed primitives or closed segment sequences
export interface Circle {
  geomType: 'circle';
  center: Pt;
  radius: number;
}

export interface Ellipse {
  geomType: 'ellipse';
  center: Pt;
  radiusX: number;
  radiusY: number;
  rotation?: number; // Optional rotation in radians
}

// Closed segment sequence (computed as closed when endpoints match)
export interface ClosedSegmentSequence {
  geomType: 'closed-sequence';
  segments: Segment[];
}

// Union of all closed geometric forms
export type ClosedGeom = Circle | Ellipse | ClosedSegmentSequence;

// Shape definition - geometric entity with boundary and optional holes
export interface Shape {
  id: string;
  pose: Pose; // Position and orientation reference
  outerBoundary: ClosedGeom; // Main shape boundary (must be closed)
  holes?: ClosedGeom[]; // Optional inner boundaries (holes, must be closed)
}

// Assembly definition - collection of positioned shapes
export interface Assembly {
  id: string;
  pose: Pose; // Assembly reference frame
  parts: Shape[]; // Constituent shapes
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
