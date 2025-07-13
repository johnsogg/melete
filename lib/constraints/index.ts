/**
 * Public API for the constraint-based 2D geometry system
 */

// Core types
export type {
  Constraint,
  PointOnLineConstraint,
  SameLengthConstraint,
  RightAngleConstraint,
  AnyConstraint,
  FlattenedPoints,
  SolverConfig,
  SolveIterationResult,
  SolveResult,
  ConstraintSystem,
  ConstraintSolver,
} from './types';

export { DEFAULT_SOLVER_CONFIG } from './types';

// Geometry utilities - constraint-specific
export {
  flattenPoints,
  unflattenPoints,
  normalizeError,
  numericalPartialDerivative,
  extractUniquePoints,
} from './geometry';

// Geometry utilities - general (re-exported from lib/geom for convenience)
export {
  distancePointToLine,
  distanceBetweenPoints,
  angleBetweenLines,
} from '../geom';

// Constraint implementations
export { pointOnLine } from './constraints/pointOnLine';
export { sameLength } from './constraints/sameLength';
export { rightAngle } from './constraints/rightAngle';

// Solver
export { createSolver } from './solver';

// Utility functions from the main utils module
export {
  pointsEqual,
  isSegmentSequenceClosed,
  DEFAULT_TOLERANCE,
} from './utils';
