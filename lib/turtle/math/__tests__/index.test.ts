/**
 * Unit tests for math utility functions
 */

import { degreesToRadians, radiansToDegrees } from '../index';

describe('Math utilities', () => {
  describe('angle conversions', () => {
    it('should convert degrees to radians', () => {
      expect(degreesToRadians(0)).toBe(0);
      expect(degreesToRadians(90)).toBeCloseTo(Math.PI / 2, 10);
      expect(degreesToRadians(180)).toBeCloseTo(Math.PI, 10);
      expect(degreesToRadians(360)).toBeCloseTo(2 * Math.PI, 10);
    });

    it('should convert radians to degrees', () => {
      expect(radiansToDegrees(0)).toBe(0);
      expect(radiansToDegrees(Math.PI / 2)).toBeCloseTo(90, 10);
      expect(radiansToDegrees(Math.PI)).toBeCloseTo(180, 10);
      expect(radiansToDegrees(2 * Math.PI)).toBeCloseTo(360, 10);
    });

    it('should be inverse operations', () => {
      const degrees = 45;
      const radians = Math.PI / 4;
      
      expect(radiansToDegrees(degreesToRadians(degrees))).toBeCloseTo(degrees, 10);
      expect(degreesToRadians(radiansToDegrees(radians))).toBeCloseTo(radians, 10);
    });
  });
});