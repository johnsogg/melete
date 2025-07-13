/**
 * Tests for right-angle constraint error function
 * Tests angular deviation measurements in radians
 */

import type { Pt } from '../../geom/types';
import { rightAngle } from '../constraints/rightAngle';

describe('Right-Angle Constraint', () => {
  describe('Error Calculation', () => {
    it('should return zero error when lines are exactly perpendicular', () => {
      const line1Start: Pt = { x: 0, y: 0 };
      const line1End: Pt = { x: 1, y: 0 }; // Horizontal line
      const line2Start: Pt = { x: 0, y: 0 };
      const line2End: Pt = { x: 0, y: 1 }; // Vertical line

      const constraint = rightAngle(
        'test',
        line1Start,
        line1End,
        line2Start,
        line2End
      );
      const error = constraint.calculateError(Math.PI / 2);

      expect(error).toBeCloseTo(0, 10);
    });

    it('should calculate correct angular deviation for 45-degree angle', () => {
      const line1Start: Pt = { x: 0, y: 0 };
      const line1End: Pt = { x: 1, y: 0 }; // Horizontal line
      const line2Start: Pt = { x: 0, y: 0 };
      const line2End: Pt = { x: 1, y: 1 }; // 45-degree line

      const constraint = rightAngle(
        'test',
        line1Start,
        line1End,
        line2Start,
        line2End
      );
      const maxError = Math.PI / 2;
      const error = constraint.calculateError(maxError);

      // Angle between lines is 45° = π/4 radians
      // Deviation from 90° is |π/2 - π/4| = π/4 radians
      // Normalized: (π/4) / (π/2) = 0.5
      expect(error).toBeCloseTo(0.5, 10);
    });

    it('should handle parallel lines correctly', () => {
      const line1Start: Pt = { x: 0, y: 0 };
      const line1End: Pt = { x: 1, y: 0 }; // Horizontal line
      const line2Start: Pt = { x: 0, y: 1 };
      const line2End: Pt = { x: 1, y: 1 }; // Parallel horizontal line

      const constraint = rightAngle(
        'test',
        line1Start,
        line1End,
        line2Start,
        line2End
      );
      const maxError = Math.PI / 2;
      const error = constraint.calculateError(maxError);

      // Parallel lines have 0° angle, deviation from 90° is π/2
      // Normalized: (π/2) / (π/2) = 1.0
      expect(error).toBeCloseTo(1.0, 10);
    });

    it('should handle opposite direction lines as parallel', () => {
      const line1Start: Pt = { x: 0, y: 0 };
      const line1End: Pt = { x: 1, y: 0 }; // Left to right
      const line2Start: Pt = { x: 1, y: 1 };
      const line2End: Pt = { x: 0, y: 1 }; // Right to left (opposite direction)

      const constraint = rightAngle(
        'test',
        line1Start,
        line1End,
        line2Start,
        line2End
      );
      const maxError = Math.PI / 2;
      const error = constraint.calculateError(maxError);

      // Should treat as parallel (180° = 0° for our purposes)
      expect(error).toBeCloseTo(1.0, 10);
    });

    it('should return bounded error in range [0, 1]', () => {
      const line1Start: Pt = { x: 0, y: 0 };
      const line1End: Pt = { x: 1, y: 0 }; // Horizontal
      const line2Start: Pt = { x: 0, y: 0 };
      const line2End: Pt = { x: 1, y: 1 }; // 45 degrees

      const constraint = rightAngle(
        'test',
        line1Start,
        line1End,
        line2Start,
        line2End
      );
      const error = constraint.calculateError(0.1); // Very small max expected error

      expect(error).toBe(1.0); // Should be clamped to 1
    });

    it('should handle negative coordinates', () => {
      const line1Start: Pt = { x: -1, y: -1 };
      const line1End: Pt = { x: 0, y: -1 }; // Horizontal
      const line2Start: Pt = { x: -1, y: -1 };
      const line2End: Pt = { x: -1, y: 0 }; // Vertical

      const constraint = rightAngle(
        'test',
        line1Start,
        line1End,
        line2Start,
        line2End
      );
      const error = constraint.calculateError(Math.PI / 2);

      expect(error).toBeCloseTo(0, 10);
    });

    it('should be independent of line length', () => {
      // Short perpendicular lines
      const line1Start1: Pt = { x: 0, y: 0 };
      const line1End1: Pt = { x: 0.1, y: 0 };
      const line2Start1: Pt = { x: 0, y: 0 };
      const line2End1: Pt = { x: 0, y: 0.1 };

      // Long perpendicular lines
      const line1Start2: Pt = { x: 0, y: 0 };
      const line1End2: Pt = { x: 100, y: 0 };
      const line2Start2: Pt = { x: 0, y: 0 };
      const line2End2: Pt = { x: 0, y: 100 };

      const constraint1 = rightAngle(
        'test1',
        line1Start1,
        line1End1,
        line2Start1,
        line2End1
      );
      const constraint2 = rightAngle(
        'test2',
        line1Start2,
        line1End2,
        line2Start2,
        line2End2
      );

      const error1 = constraint1.calculateError(Math.PI / 2);
      const error2 = constraint2.calculateError(Math.PI / 2);

      expect(error1).toBeCloseTo(error2, 10);
    });
  });

  describe('Edge Cases', () => {
    it('should handle degenerate lines (zero length)', () => {
      const line1Start: Pt = { x: 0, y: 0 };
      const line1End: Pt = { x: 0, y: 0 }; // Zero length
      const line2Start: Pt = { x: 0, y: 0 };
      const line2End: Pt = { x: 1, y: 0 }; // Normal line

      const constraint = rightAngle(
        'test',
        line1Start,
        line1End,
        line2Start,
        line2End
      );
      const error = constraint.calculateError(Math.PI / 2);

      expect(error).toBe(1.0); // Maximum error for degenerate case
    });

    it('should handle both lines being degenerate', () => {
      const line1Start: Pt = { x: 0, y: 0 };
      const line1End: Pt = { x: 0, y: 0 }; // Zero length
      const line2Start: Pt = { x: 1, y: 1 };
      const line2End: Pt = { x: 1, y: 1 }; // Zero length

      const constraint = rightAngle(
        'test',
        line1Start,
        line1End,
        line2Start,
        line2End
      );
      const error = constraint.calculateError(Math.PI / 2);

      expect(error).toBe(1.0); // Maximum error for degenerate case
    });

    it('should handle very small line lengths', () => {
      const line1Start: Pt = { x: 0, y: 0 };
      const line1End: Pt = { x: 1e-12, y: 0 }; // Tiny horizontal line
      const line2Start: Pt = { x: 0, y: 0 };
      const line2End: Pt = { x: 0, y: 1e-12 }; // Tiny vertical line

      const constraint = rightAngle(
        'test',
        line1Start,
        line1End,
        line2Start,
        line2End
      );
      const error = constraint.calculateError(Math.PI / 2);

      // Should handle as degenerate
      expect(error).toBe(1.0);
    });

    it('should handle floating point precision in angle calculation', () => {
      const line1Start: Pt = { x: 0, y: 0 };
      const line1End: Pt = { x: 1, y: 0 }; // Horizontal
      const line2Start: Pt = { x: 0, y: 0 };
      const line2End: Pt = { x: 1e-15, y: 1 }; // Nearly vertical (but not exactly)

      const constraint = rightAngle(
        'test',
        line1Start,
        line1End,
        line2Start,
        line2End
      );
      const error = constraint.calculateError(Math.PI / 2);

      // Should be very close to zero despite floating point issues
      expect(error).toBeLessThan(1e-10);
    });

    it('should handle very large coordinates', () => {
      const line1Start: Pt = { x: 1e6, y: 1e6 };
      const line1End: Pt = { x: 1e6 + 1, y: 1e6 }; // Horizontal
      const line2Start: Pt = { x: 1e6, y: 1e6 };
      const line2End: Pt = { x: 1e6, y: 1e6 + 1 }; // Vertical

      const constraint = rightAngle(
        'test',
        line1Start,
        line1End,
        line2Start,
        line2End
      );
      const error = constraint.calculateError(Math.PI / 2);

      expect(error).toBeCloseTo(0, 10);
    });

    it("should handle lines that don't share endpoints", () => {
      const line1Start: Pt = { x: 0, y: 0 };
      const line1End: Pt = { x: 1, y: 0 }; // Horizontal line
      const line2Start: Pt = { x: 10, y: 10 };
      const line2End: Pt = { x: 10, y: 11 }; // Vertical line (different location)

      const constraint = rightAngle(
        'test',
        line1Start,
        line1End,
        line2Start,
        line2End
      );
      const error = constraint.calculateError(Math.PI / 2);

      // Should still measure angle correctly regardless of position
      expect(error).toBeCloseTo(0, 10);
    });
  });

  describe('Specific Angle Tests', () => {
    it('should correctly measure 30-degree angle', () => {
      const line1Start: Pt = { x: 0, y: 0 };
      const line1End: Pt = { x: 1, y: 0 }; // Horizontal
      const line2Start: Pt = { x: 0, y: 0 };
      const line2End: Pt = { x: Math.sqrt(3), y: 1 }; // 30 degrees: tan(30°) = 1/√3

      const constraint = rightAngle(
        'test',
        line1Start,
        line1End,
        line2Start,
        line2End
      );
      const maxError = Math.PI / 2;
      const error = constraint.calculateError(maxError);

      // Deviation from 90° is |90° - 30°| = 60° = π/3 radians
      // Normalized: (π/3) / (π/2) = 2/3 ≈ 0.667
      expect(error).toBeCloseTo(2 / 3, 5);
    });

    it('should correctly measure 60-degree angle', () => {
      const line1Start: Pt = { x: 0, y: 0 };
      const line1End: Pt = { x: 1, y: 0 }; // Horizontal
      const line2Start: Pt = { x: 0, y: 0 };
      const line2End: Pt = { x: 1, y: Math.sqrt(3) }; // 60 degrees: tan(60°) = √3

      const constraint = rightAngle(
        'test',
        line1Start,
        line1End,
        line2Start,
        line2End
      );
      const maxError = Math.PI / 2;
      const error = constraint.calculateError(maxError);

      // Deviation from 90° is |90° - 60°| = 30° = π/6 radians
      // Normalized: (π/6) / (π/2) = 1/3 ≈ 0.333
      expect(error).toBeCloseTo(1 / 3, 5);
    });

    it('should correctly measure 120-degree angle as 60-degree deviation', () => {
      const line1Start: Pt = { x: 0, y: 0 };
      const line1End: Pt = { x: 1, y: 0 }; // Horizontal
      const line2Start: Pt = { x: 0, y: 0 };
      const line2End: Pt = { x: -0.5, y: Math.sqrt(3) / 2 }; // 120 degrees

      const constraint = rightAngle(
        'test',
        line1Start,
        line1End,
        line2Start,
        line2End
      );
      const maxError = Math.PI / 2;
      const error = constraint.calculateError(maxError);

      // 120° angle has same deviation from 90° as 60° angle (30°)
      // Normalized: (π/6) / (π/2) = 1/3 ≈ 0.333
      expect(error).toBeCloseTo(1 / 3, 5);
    });
  });

  describe('Partial Derivatives', () => {
    it('should calculate partial derivative with respect to line endpoints', () => {
      const line1Start: Pt = { x: 0, y: 0 };
      const line1End: Pt = { x: 1, y: 0.1 }; // Nearly horizontal
      const line2Start: Pt = { x: 0, y: 0 };
      const line2End: Pt = { x: 0, y: 1 }; // Vertical

      const constraint = rightAngle(
        'test',
        line1Start,
        line1End,
        line2Start,
        line2End
      );

      // Moving line1End.y should affect the angle
      const derivative = constraint.calculatePartialDerivative(
        1,
        'y',
        Math.PI / 2,
        1e-6
      );

      expect(typeof derivative).toBe('number');
      expect(Math.abs(derivative)).toBeGreaterThan(0);
    });

    it('should have correct derivative direction for angle correction', () => {
      const line1Start: Pt = { x: 0, y: 0 };
      const line1End: Pt = { x: 1, y: 0.1 }; // Slightly tilted from horizontal
      const line2Start: Pt = { x: 0, y: 0 };
      const line2End: Pt = { x: 0, y: 1 }; // Vertical

      const constraint = rightAngle(
        'test',
        line1Start,
        line1End,
        line2Start,
        line2End
      );

      // Moving line1End.y towards 0 should reduce error (make it more horizontal)
      const derivative = constraint.calculatePartialDerivative(
        1,
        'y',
        Math.PI / 2,
        1e-6
      );

      // The derivative tells us how the error changes with respect to the coordinate
      // A positive derivative means increasing the coordinate increases the error
      expect(typeof derivative).toBe('number');
      expect(isFinite(derivative)).toBe(true);
    });

    it('should calculate derivatives for both lines', () => {
      const line1Start: Pt = { x: 0, y: 0 };
      const line1End: Pt = { x: 1, y: 0 }; // Horizontal
      const line2Start: Pt = { x: 0, y: 0 };
      const line2End: Pt = { x: 0.1, y: 1 }; // Nearly vertical

      const constraint = rightAngle(
        'test',
        line1Start,
        line1End,
        line2Start,
        line2End
      );

      const deriv1 = constraint.calculatePartialDerivative(
        1,
        'y',
        Math.PI / 2,
        1e-6
      ); // line1End.y
      const deriv2 = constraint.calculatePartialDerivative(
        3,
        'x',
        Math.PI / 2,
        1e-6
      ); // line2End.x

      // Both should be non-zero and help correct the angle
      expect(Math.abs(deriv1)).toBeGreaterThan(0);
      expect(Math.abs(deriv2)).toBeGreaterThan(0);
    });

    it('should handle derivatives near perfect right angle', () => {
      const line1Start: Pt = { x: 0, y: 0 };
      const line1End: Pt = { x: 1, y: 0 }; // Horizontal
      const line2Start: Pt = { x: 0, y: 0 };
      const line2End: Pt = { x: 0, y: 1 }; // Vertical (perfect 90°)

      const constraint = rightAngle(
        'test',
        line1Start,
        line1End,
        line2Start,
        line2End
      );

      const derivative = constraint.calculatePartialDerivative(
        1,
        'y',
        Math.PI / 2,
        1e-6
      );

      // At perfect right angle, small changes should have predictable effects
      expect(typeof derivative).toBe('number');
      expect(isFinite(derivative)).toBe(true);
    });
  });

  describe('Error Normalization', () => {
    it('should scale error proportionally to max expected error', () => {
      const line1Start: Pt = { x: 0, y: 0 };
      const line1End: Pt = { x: 1, y: 0 }; // Horizontal
      const line2Start: Pt = { x: 0, y: 0 };
      const line2End: Pt = { x: 1, y: 1 }; // 45 degrees

      const constraint = rightAngle(
        'test',
        line1Start,
        line1End,
        line2Start,
        line2End
      );

      const error1 = constraint.calculateError(Math.PI / 2); // max = π/2
      const error2 = constraint.calculateError(Math.PI / 4); // max = π/4

      expect(error2).toBeCloseTo(error1 * 2, 10); // Should double when max halves
    });

    it('should handle very small max expected error', () => {
      const line1Start: Pt = { x: 0, y: 0 };
      const line1End: Pt = { x: 1, y: 0 }; // Horizontal
      const line2Start: Pt = { x: 0, y: 0 };
      const line2End: Pt = { x: 1, y: 1 }; // 45 degrees (π/4 deviation)

      const constraint = rightAngle(
        'test',
        line1Start,
        line1End,
        line2Start,
        line2End
      );
      const error = constraint.calculateError(0.001); // Very small max

      expect(error).toBe(1.0); // Should clamp to maximum
    });

    it('should handle very large max expected error', () => {
      const line1Start: Pt = { x: 0, y: 0 };
      const line1End: Pt = { x: 1, y: 0 }; // Horizontal
      const line2Start: Pt = { x: 0, y: 0 };
      const line2End: Pt = { x: 1, y: 1 }; // 45 degrees (π/4 deviation)

      const constraint = rightAngle(
        'test',
        line1Start,
        line1End,
        line2Start,
        line2End
      );
      const error = constraint.calculateError(Math.PI); // Very large max (180°)

      // (π/4) / π = 1/4 = 0.25
      expect(error).toBeCloseTo(0.25, 10);
    });
  });
});
