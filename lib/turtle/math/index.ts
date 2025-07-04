/**
 * Math utilities for turtle graphics
 * 
 * Provides 4x4 matrix operations and 3D vector utilities
 * for geometric transformations in turtle graphics.
 */

export * from './matrix';
export * from './vector';

export function degreesToRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

export function radiansToDegrees(radians: number): number {
  return (radians * 180) / Math.PI;
}