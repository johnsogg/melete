/**
 * Interpolation utilities for smooth animations and transitions
 */

import { Pt, Vec } from '../geom/types';

/**
 * Linear interpolation between two numbers
 * @param start - Starting value
 * @param end - Ending value
 * @param factor - Interpolation factor (0 = start, 1 = end)
 * @returns Interpolated value
 */
export const lerp = (start: number, end: number, factor: number): number => {
  return start + (end - start) * factor;
};

/**
 * Linear interpolation between two 2D points
 * @param start - Starting point
 * @param end - Ending point
 * @param factor - Interpolation factor (0 = start, 1 = end)
 * @returns Interpolated point
 */
export const lerpPt = (start: Pt, end: Pt, factor: number): Pt => {
  return {
    x: lerp(start.x, end.x, factor),
    y: lerp(start.y, end.y, factor),
    ...(start.z !== undefined &&
      end.z !== undefined && { z: lerp(start.z, end.z, factor) }),
  };
};

/**
 * Linear interpolation between two 2D vectors
 * @param start - Starting vector
 * @param end - Ending vector
 * @param factor - Interpolation factor (0 = start, 1 = end)
 * @returns Interpolated vector
 */
export const lerpVec = (start: Vec, end: Vec, factor: number): Vec => {
  return {
    dx: lerp(start.dx, end.dx, factor),
    dy: lerp(start.dy, end.dy, factor),
    ...(start.dz !== undefined &&
      end.dz !== undefined && { dz: lerp(start.dz, end.dz, factor) }),
  };
};
