/**
 * Extended geometry operations and data transformation utilities for constraint system
 */

import type { Pt } from '../geom/types';
import type { FlattenedPoints } from './types';
import { clamp } from '../geom';

/**
 * Flatten a collection of points into a coordinate array for gradient descent
 * Automatically deduplicates shared point references
 */
export const flattenPoints = (points: readonly Pt[]): FlattenedPoints => {
  // Deduplicate points by reference
  const uniquePoints = Array.from(new Set(points));

  const coordinates: number[] = [];
  const pointMap = new Map<Pt, [number, number]>();
  const indexMap = new Map<number, Pt>();

  uniquePoints.forEach((point, i) => {
    const xIndex = i * 2;
    const yIndex = i * 2 + 1;

    coordinates.push(point.x, point.y);
    pointMap.set(point, [xIndex, yIndex]);
    indexMap.set(xIndex, point);
    indexMap.set(yIndex, point);
  });

  return { coordinates, pointMap, indexMap };
};

/**
 * Update point objects with coordinates from flattened representation
 * Modifies the original point objects in place
 */
export const unflattenPoints = (flattened: FlattenedPoints): void => {
  flattened.pointMap.forEach(([xIndex, yIndex], point) => {
    // Directly modify the point objects
    (point as { x: number; y: number }).x = flattened.coordinates[xIndex];
    (point as { x: number; y: number }).y = flattened.coordinates[yIndex];
  });
};

/**
 * Normalize an error value to the range [0, 1] using max expected error
 */
export const normalizeError = (
  actualError: number,
  maxExpectedError: number
): number => {
  return clamp(Math.abs(actualError) / maxExpectedError, 0, 1);
};

/**
 * Calculate numerical partial derivative using central difference method
 */
export const numericalPartialDerivative = (
  errorFunction: () => number,
  setCoordinate: (value: number) => void,
  originalValue: number,
  stepSize: number
): number => {
  // Calculate f(x + h)
  setCoordinate(originalValue + stepSize);
  const errorPlus = errorFunction();

  // Calculate f(x - h)
  setCoordinate(originalValue - stepSize);
  const errorMinus = errorFunction();

  // Restore original value
  setCoordinate(originalValue);

  // Return central difference: (f(x+h) - f(x-h)) / (2h)
  return (errorPlus - errorMinus) / (2 * stepSize);
};

/**
 * Get all unique points referenced by a collection of constraints
 */
export const extractUniquePoints = (
  constraints: readonly { points: readonly Pt[] }[]
): Pt[] => {
  const pointSet = new Set<Pt>();

  constraints.forEach(constraint => {
    constraint.points.forEach(point => pointSet.add(point));
  });

  return Array.from(pointSet);
};
