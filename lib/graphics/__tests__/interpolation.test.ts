/**
 * Unit tests for interpolation utilities
 */

import { lerp, lerpPt, lerpVec } from '../interpolation';

describe('Interpolation utilities', () => {
  describe('lerp', () => {
    it('should interpolate between two numbers', () => {
      expect(lerp(0, 10, 0)).toBe(0);
      expect(lerp(0, 10, 0.5)).toBe(5);
      expect(lerp(0, 10, 1)).toBe(10);
    });

    it('should handle negative numbers', () => {
      expect(lerp(-5, 5, 0.5)).toBe(0);
      expect(lerp(-10, -5, 0.5)).toBe(-7.5);
    });

    it('should handle factors outside [0, 1]', () => {
      expect(lerp(0, 10, -0.5)).toBe(-5);
      expect(lerp(0, 10, 1.5)).toBe(15);
    });

    it('should handle identical start and end values', () => {
      expect(lerp(5, 5, 0.5)).toBe(5);
    });
  });

  describe('lerpPt', () => {
    it('should interpolate between two 2D points', () => {
      const start = { x: 0, y: 0 };
      const end = { x: 10, y: 20 };

      expect(lerpPt(start, end, 0)).toEqual({ x: 0, y: 0 });
      expect(lerpPt(start, end, 0.5)).toEqual({ x: 5, y: 10 });
      expect(lerpPt(start, end, 1)).toEqual({ x: 10, y: 20 });
    });

    it('should interpolate between two 3D points', () => {
      const start = { x: 0, y: 0, z: 0 };
      const end = { x: 10, y: 20, z: 30 };

      expect(lerpPt(start, end, 0)).toEqual({ x: 0, y: 0, z: 0 });
      expect(lerpPt(start, end, 0.5)).toEqual({ x: 5, y: 10, z: 15 });
      expect(lerpPt(start, end, 1)).toEqual({ x: 10, y: 20, z: 30 });
    });

    it('should handle mixed 2D and 3D points', () => {
      const start = { x: 0, y: 0 };
      const end = { x: 10, y: 20, z: 30 };

      const result = lerpPt(start, end, 0.5);
      expect(result).toEqual({ x: 5, y: 10 });
      expect(result.z).toBeUndefined();
    });

    it('should handle negative coordinates', () => {
      const start = { x: -5, y: -10 };
      const end = { x: 5, y: 10 };

      expect(lerpPt(start, end, 0.5)).toEqual({ x: 0, y: 0 });
    });
  });

  describe('lerpVec', () => {
    it('should interpolate between two 2D vectors', () => {
      const start = { dx: 0, dy: 0 };
      const end = { dx: 10, dy: 20 };

      expect(lerpVec(start, end, 0)).toEqual({ dx: 0, dy: 0 });
      expect(lerpVec(start, end, 0.5)).toEqual({ dx: 5, dy: 10 });
      expect(lerpVec(start, end, 1)).toEqual({ dx: 10, dy: 20 });
    });

    it('should interpolate between two 3D vectors', () => {
      const start = { dx: 0, dy: 0, dz: 0 };
      const end = { dx: 10, dy: 20, dz: 30 };

      expect(lerpVec(start, end, 0)).toEqual({ dx: 0, dy: 0, dz: 0 });
      expect(lerpVec(start, end, 0.5)).toEqual({ dx: 5, dy: 10, dz: 15 });
      expect(lerpVec(start, end, 1)).toEqual({ dx: 10, dy: 20, dz: 30 });
    });

    it('should handle mixed 2D and 3D vectors', () => {
      const start = { dx: 0, dy: 0 };
      const end = { dx: 10, dy: 20, dz: 30 };

      const result = lerpVec(start, end, 0.5);
      expect(result).toEqual({ dx: 5, dy: 10 });
      expect(result.dz).toBeUndefined();
    });

    it('should handle negative deltas', () => {
      const start = { dx: -5, dy: -10 };
      const end = { dx: 5, dy: 10 };

      expect(lerpVec(start, end, 0.5)).toEqual({ dx: 0, dy: 0 });
    });
  });
});
