/**
 * Async gradient descent solver for constraint systems
 */

import type {
  ConstraintSolver,
  ConstraintSystem,
  SolveResult,
  SolveIterationResult,
  AnyConstraint,
} from './types';
import {
  flattenPoints,
  unflattenPoints,
  extractUniquePoints,
} from './geometry';

/**
 * Default max expected error values for different constraint types
 */
const DEFAULT_MAX_EXPECTED_ERRORS = {
  'point-on-line': 100, // Canvas diagonal-like distance
  'same-length': 100, // Max expected length difference
  'right-angle': Math.PI / 2, // 90 degrees max deviation
} as const;

/**
 * Get the max expected error for a constraint type
 */
const getMaxExpectedError = (constraint: AnyConstraint): number => {
  return DEFAULT_MAX_EXPECTED_ERRORS[constraint.type];
};

/**
 * Async gradient descent constraint solver implementation
 */
export class GradientDescentSolver implements ConstraintSolver {
  private _isRunning = false;
  private _isPaused = false;
  private _shouldStop = false;
  private _iterationListeners: ((result: SolveIterationResult) => void)[] = [];

  get isRunning(): boolean {
    return this._isRunning;
  }

  get isPaused(): boolean {
    return this._isPaused;
  }

  async solve(system: ConstraintSystem): Promise<SolveResult> {
    if (this._isRunning) {
      throw new Error('Solver is already running');
    }

    this._isRunning = true;
    this._isPaused = false;
    this._shouldStop = false;

    try {
      return await this._performSolve(system);
    } finally {
      this._isRunning = false;
      this._isPaused = false;
      this._shouldStop = false;
    }
  }

  pause(): void {
    if (this._isRunning && !this._isPaused) {
      this._isPaused = true;
    }
  }

  resume(): void {
    if (this._isRunning && this._isPaused) {
      this._isPaused = false;
    }
  }

  stop(): void {
    this._shouldStop = true;
  }

  onIteration(listener: (result: SolveIterationResult) => void): void {
    this._iterationListeners.push(listener);
  }

  private async _performSolve(system: ConstraintSystem): Promise<SolveResult> {
    const { constraints, config } = system;

    // Extract unique points and create flattened representation
    const uniquePoints = extractUniquePoints(constraints);
    const flattened = flattenPoints(uniquePoints);

    let iteration = 0;
    let totalError = Number.MAX_VALUE;
    let constraintErrors: number[] = [];

    while (iteration < config.maxIterations && !this._shouldStop) {
      // Handle pause
      while (this._isPaused && !this._shouldStop) {
        await this._sleep(10); // Wait 10ms while paused
      }

      if (this._shouldStop) {
        break;
      }

      const previousError = totalError;

      // Calculate current errors
      constraintErrors = constraints.map(constraint => {
        const maxError = getMaxExpectedError(constraint);
        return constraint.calculateError(maxError);
      });

      totalError = constraintErrors.reduce(
        (sum, error) => sum + error * error,
        0
      );

      // Calculate error reduction
      const errorReduction = previousError - totalError;

      // Create iteration result
      const iterationResult: SolveIterationResult = {
        iteration,
        totalError,
        errorReduction: iteration === 0 ? 0 : errorReduction,
        constraintErrors: [...constraintErrors],
        converged: totalError < config.convergenceTolerance,
        shouldContinue:
          iteration === 0 ||
          (errorReduction > config.minErrorReduction &&
            totalError > config.convergenceTolerance),
      };

      // Notify listeners
      this._iterationListeners.forEach(listener => {
        try {
          listener(iterationResult);
        } catch (error) {
          console.warn('Error in iteration listener:', error);
        }
      });

      // Check convergence
      if (iterationResult.converged) {
        return {
          success: true,
          iterations: iteration,
          finalError: totalError,
          finalConstraintErrors: constraintErrors,
          terminationReason: 'converged',
        };
      }

      // Check progress after first iteration
      if (iteration > 0 && !iterationResult.shouldContinue) {
        return {
          success: false,
          iterations: iteration,
          finalError: totalError,
          finalConstraintErrors: constraintErrors,
          terminationReason: 'insufficient-progress',
        };
      }

      // Calculate and apply gradient
      const gradient = new Array(flattened.coordinates.length).fill(0);

      constraints.forEach(constraint => {
        const maxError = getMaxExpectedError(constraint);

        constraint.points.forEach((point, pointIndex) => {
          const indices = flattened.pointMap.get(point);
          if (!indices) return;

          const [xIndex, yIndex] = indices;

          // Accumulate gradients for shared points
          gradient[xIndex] += constraint.calculatePartialDerivative(
            pointIndex,
            'x',
            maxError,
            config.differentiationStep
          );
          gradient[yIndex] += constraint.calculatePartialDerivative(
            pointIndex,
            'y',
            maxError,
            config.differentiationStep
          );
        });
      });

      // Apply gradient descent step
      for (let i = 0; i < flattened.coordinates.length; i++) {
        flattened.coordinates[i] -= config.learningRate * gradient[i];
      }

      // Update point objects
      unflattenPoints(flattened);

      iteration++;
    }

    // Calculate final errors
    constraintErrors = constraints.map(constraint => {
      const maxError = getMaxExpectedError(constraint);
      return constraint.calculateError(maxError);
    });

    totalError = constraintErrors.reduce(
      (sum, error) => sum + error * error,
      0
    );

    return {
      success: false,
      iterations: iteration,
      finalError: totalError,
      finalConstraintErrors: constraintErrors,
      terminationReason: this._shouldStop ? 'error' : 'max-iterations',
      errorMessage: this._shouldStop ? 'Solver was stopped' : undefined,
    };
  }

  private _sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Factory function to create a new gradient descent solver
 */
export const createSolver = (): ConstraintSolver => {
  return new GradientDescentSolver();
};
