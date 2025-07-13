/**
 * Same-length constraint implementation
 * Maintains equal distance between two pairs of points
 */

import type { Pt } from '../../geom/types';
import type { SameLengthConstraint } from '../types';
import { distanceBetweenPoints } from '../../geom';
import { normalizeError, numericalPartialDerivative } from '../geometry';

/**
 * Implementation of same-length constraint
 */
export class SameLengthConstraintImpl implements SameLengthConstraint {
  readonly type = 'same-length' as const;

  constructor(
    public readonly id: string,
    public readonly points: readonly [Pt, Pt, Pt, Pt] // [start1, end1, start2, end2]
  ) {}

  calculateError(maxExpectedError: number): number {
    const [start1, end1, start2, end2] = this.points;

    const length1 = distanceBetweenPoints(start1, end1);
    const length2 = distanceBetweenPoints(start2, end2);

    const lengthDifference = Math.abs(length1 - length2);

    return normalizeError(lengthDifference, maxExpectedError);
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
 * Factory function to create a same-length constraint
 */
export const sameLength = (
  id: string,
  start1: Pt,
  end1: Pt,
  start2: Pt,
  end2: Pt
): SameLengthConstraint => {
  return new SameLengthConstraintImpl(id, [start1, end1, start2, end2]);
};
