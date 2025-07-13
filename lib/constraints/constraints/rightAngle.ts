/**
 * Right-angle constraint implementation
 * Maintains a 90-degree angle between two lines
 */

import type { Pt } from '../../geom/types';
import type { RightAngleConstraint } from '../types';
import { angleBetweenLines } from '../../geom';
import { normalizeError, numericalPartialDerivative } from '../geometry';

/**
 * Implementation of right-angle constraint
 */
export class RightAngleConstraintImpl implements RightAngleConstraint {
  readonly type = 'right-angle' as const;

  constructor(
    public readonly id: string,
    public readonly points: readonly [Pt, Pt, Pt, Pt] // [line1Start, line1End, line2Start, line2End]
  ) {}

  calculateError(maxExpectedError: number): number {
    const [line1Start, line1End, line2Start, line2End] = this.points;

    const angle = angleBetweenLines(line1Start, line1End, line2Start, line2End);

    // Handle degenerate line case
    if (!isFinite(angle)) {
      return 1.0; // Maximum error for degenerate lines
    }

    // Error is deviation from π/2 (90 degrees)
    const targetAngle = Math.PI / 2;
    const angleDifference = Math.abs(angle - targetAngle);

    return normalizeError(angleDifference, maxExpectedError);
  }

  calculatePartialDerivative(
    pointIndex: number,
    coordinate: 'x' | 'y',
    maxExpectedError: number,
    stepSize: number
  ): number {
    const point = this.points[pointIndex];
    const originalValue = coordinate === 'x' ? point.x : point.y;

    return numericalPartialDerivative(
      () => this.calculateError(maxExpectedError),
      (value: number) => {
        (point as { x: number; y: number })[coordinate] = value;
      },
      originalValue,
      stepSize
    );
  }
}

/**
 * Factory function to create a right-angle constraint
 */
export const rightAngle = (
  id: string,
  line1Start: Pt,
  line1End: Pt,
  line2Start: Pt,
  line2End: Pt
): RightAngleConstraint => {
  return new RightAngleConstraintImpl(id, [
    line1Start,
    line1End,
    line2Start,
    line2End,
  ]);
};
