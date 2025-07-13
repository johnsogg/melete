/**
 * Core types for the constraint-based 2D geometry system
 */

import type { Pt } from '../geom/types';

/**
 * Base interface for all constraint types
 */
export interface Constraint {
  readonly id: string;
  readonly type: string;
  readonly points: readonly Pt[];

  /**
   * Calculate the error for this constraint
   * @param maxExpectedError Maximum expected error value for normalization
   * @returns Normalized error value in range [0, 1]
   */
  calculateError(maxExpectedError: number): number;

  /**
   * Calculate the partial derivative of the error function with respect to a point coordinate
   * @param pointIndex Index of the point in the points array
   * @param coordinate 'x' or 'y' coordinate
   * @param maxExpectedError Maximum expected error value for normalization
   * @param stepSize Step size for numerical differentiation
   * @returns Partial derivative value
   */
  calculatePartialDerivative(
    pointIndex: number,
    coordinate: 'x' | 'y',
    maxExpectedError: number,
    stepSize: number
  ): number;
}

/**
 * Point-on-line constraint: maintains a point on a line defined by two other points
 */
export interface PointOnLineConstraint extends Constraint {
  readonly type: 'point-on-line';
  readonly points: readonly [Pt, Pt, Pt]; // [point, lineStart, lineEnd]
}

/**
 * Same-length constraint: maintains equal distance between two pairs of points
 */
export interface SameLengthConstraint extends Constraint {
  readonly type: 'same-length';
  readonly points: readonly [Pt, Pt, Pt, Pt]; // [start1, end1, start2, end2]
}

/**
 * Right-angle constraint: maintains a 90-degree angle between two lines
 */
export interface RightAngleConstraint extends Constraint {
  readonly type: 'right-angle';
  readonly points: readonly [Pt, Pt, Pt, Pt]; // [line1Start, line1End, line2Start, line2End]
}

/**
 * Union of all constraint types
 */
export type AnyConstraint =
  | PointOnLineConstraint
  | SameLengthConstraint
  | RightAngleConstraint;

/**
 * Flattened representation of points for gradient descent
 * Maps point references to their x,y coordinates in a flat array
 */
export interface FlattenedPoints {
  /** Flat array of coordinates: [x1, y1, x2, y2, ...] */
  readonly coordinates: number[];
  /** Map from point reference to coordinate indices [xIndex, yIndex] */
  readonly pointMap: Map<Pt, [number, number]>;
  /** Reverse map from coordinate indices to point references */
  readonly indexMap: Map<number, Pt>;
}

/**
 * Configuration for the gradient descent solver
 */
export interface SolverConfig {
  /** Convergence tolerance - solver stops when total error is below this */
  readonly convergenceTolerance: number;
  /** Step size for numerical differentiation */
  readonly differentiationStep: number;
  /** Learning rate for gradient descent iterations */
  readonly learningRate: number;
  /** Maximum number of iterations before giving up */
  readonly maxIterations: number;
  /** Minimum error reduction per iteration to continue */
  readonly minErrorReduction: number;
}

/**
 * Result of a gradient descent solve iteration
 */
export interface SolveIterationResult {
  /** Iteration number (0-based) */
  readonly iteration: number;
  /** Total error after this iteration */
  readonly totalError: number;
  /** Error reduction from previous iteration */
  readonly errorReduction: number;
  /** Individual constraint errors */
  readonly constraintErrors: readonly number[];
  /** Whether convergence was achieved */
  readonly converged: boolean;
  /** Whether the solver should continue */
  readonly shouldContinue: boolean;
}

/**
 * Final result of constraint solving
 */
export interface SolveResult {
  /** Whether the solve was successful */
  readonly success: boolean;
  /** Total number of iterations performed */
  readonly iterations: number;
  /** Final total error */
  readonly finalError: number;
  /** Final individual constraint errors */
  readonly finalConstraintErrors: readonly number[];
  /** Reason for termination */
  readonly terminationReason:
    | 'converged'
    | 'max-iterations'
    | 'insufficient-progress'
    | 'error';
  /** Error message if solve failed */
  readonly errorMessage?: string;
}

/**
 * Constraint system state
 */
export interface ConstraintSystem {
  /** All constraints in the system */
  readonly constraints: readonly AnyConstraint[];
  /** All unique points referenced by constraints */
  readonly points: readonly Pt[];
  /** Current solver configuration */
  readonly config: SolverConfig;
}

/**
 * Async constraint solver interface
 */
export interface ConstraintSolver {
  /** Whether the solver is currently running */
  readonly isRunning: boolean;
  /** Whether the solver is paused */
  readonly isPaused: boolean;

  /**
   * Start solving the constraint system
   * @param system The constraint system to solve
   * @returns Promise that resolves when solving completes
   */
  solve(system: ConstraintSystem): Promise<SolveResult>;

  /**
   * Pause the currently running solver
   */
  pause(): void;

  /**
   * Resume a paused solver
   */
  resume(): void;

  /**
   * Stop the solver completely
   */
  stop(): void;

  /**
   * Add a listener for iteration results
   * @param listener Function called after each iteration
   */
  onIteration(listener: (result: SolveIterationResult) => void): void;
}

/**
 * Default solver configuration
 */
export const DEFAULT_SOLVER_CONFIG: SolverConfig = {
  convergenceTolerance: 1e-4,
  differentiationStep: 1e-6,
  learningRate: 0.1,
  maxIterations: 1000,
  minErrorReduction: 1e-8,
};
