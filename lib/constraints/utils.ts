/**
 * Utility functions for the constraint system
 */

import type { Pt, SegmentSequence } from '../geom/types';

/**
 * Default tolerance for floating-point comparisons
 */
export const DEFAULT_TOLERANCE = 1e-6;

/**
 * Check if two points are equal within a given tolerance
 */
export const pointsEqual = (
  p1: Pt,
  p2: Pt,
  tolerance: number = DEFAULT_TOLERANCE
): boolean => {
  return Math.abs(p1.x - p2.x) < tolerance && Math.abs(p1.y - p2.y) < tolerance;
};

/**
 * Check if a segment sequence forms a closed loop
 * Returns true if the start point of the first segment equals the end point of the last segment
 */
export const isSegmentSequenceClosed = (
  sequence: SegmentSequence,
  tolerance: number = DEFAULT_TOLERANCE
): boolean => {
  if (sequence.segments.length === 0) return false;

  const first = sequence.segments[0];
  const last = sequence.segments[sequence.segments.length - 1];

  return pointsEqual(first.start, last.end, tolerance);
};
