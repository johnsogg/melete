/**
 * Point-on-line constraint implementation
 * Maintains a point on a line defined by two other points
 */

import type { Pt } from '../../geom/types';
import type { PointOnLineConstraint } from '../types';
import { distancePointToLine } from '../../geom';
import { normalizeError, numericalPartialDerivative } from '../geometry';

/**
 * Implementation of point-on-line constraint
 */
export class PointOnLineConstraintImpl implements PointOnLineConstraint {
  readonly type = 'point-on-line' as const;

  constructor(
    public readonly id: string,
    public readonly points: readonly [Pt, Pt, Pt] // [point, lineStart, lineEnd]
  ) {}

  calculateError(maxExpectedError: number): number {
    const [point, lineStart, lineEnd] = this.points;

    const distance = distancePointToLine(point, lineStart, lineEnd);

    // Handle degenerate line case
    if (!isFinite(distance)) {
      return 1.0; // Maximum error for degenerate lines
    }

    return normalizeError(distance, maxExpectedError);
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
 * Factory function to create a point-on-line constraint
 */
export const pointOnLine = (
  id: string,
  point: Pt,
  lineStart: Pt,
  lineEnd: Pt
): PointOnLineConstraint => {
  return new PointOnLineConstraintImpl(id, [point, lineStart, lineEnd]);
};
