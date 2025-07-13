/**
 * Tests for same-length constraint error function
 * Tests length difference calculations and normalization
 */

import type { Pt } from '../../geom/types';
import { sameLength } from '../constraints/sameLength';

describe('Same-Length Constraint', () => {
  describe('Error Calculation', () => {
    it('should return zero error when lengths are exactly equal', () => {
      const start1: Pt = { x: 0, y: 0 };
      const end1: Pt = { x: 3, y: 4 }; // Length = 5
      const start2: Pt = { x: 10, y: 10 };
      const end2: Pt = { x: 13, y: 14 }; // Also length = 5

      const constraint = sameLength('test', start1, end1, start2, end2);
      const error = constraint.calculateError(10);

      expect(error).toBeCloseTo(0, 10);
    });

    it('should calculate correct length difference', () => {
      const start1: Pt = { x: 0, y: 0 };
      const end1: Pt = { x: 3, y: 0 }; // Length = 3
      const start2: Pt = { x: 0, y: 0 };
      const end2: Pt = { x: 5, y: 0 }; // Length = 5

      const constraint = sameLength('test', start1, end1, start2, end2);
      const maxError = 10;
      const error = constraint.calculateError(maxError);

      // Error should be |3-5|/10 = 2/10 = 0.2
      expect(error).toBeCloseTo(0.2, 10);
    });

    it('should handle diagonal line segments', () => {
      const start1: Pt = { x: 0, y: 0 };
      const end1: Pt = { x: 3, y: 4 }; // Length = 5 (3-4-5 triangle)
      const start2: Pt = { x: 0, y: 0 };
      const end2: Pt = { x: 5, y: 12 }; // Length = 13 (5-12-13 triangle)

      const constraint = sameLength('test', start1, end1, start2, end2);
      const maxError = 20;
      const error = constraint.calculateError(maxError);

      // Error should be |5-13|/20 = 8/20 = 0.4
      expect(error).toBeCloseTo(0.4, 10);
    });

    it('should return bounded error in range [0, 1]', () => {
      const start1: Pt = { x: 0, y: 0 };
      const end1: Pt = { x: 1, y: 0 }; // Length = 1
      const start2: Pt = { x: 0, y: 0 };
      const end2: Pt = { x: 1000, y: 0 }; // Length = 1000

      const constraint = sameLength('test', start1, end1, start2, end2);
      const error = constraint.calculateError(100); // max expected much smaller than actual

      expect(error).toBe(1.0); // Should be clamped to 1
    });

    it('should handle negative coordinates', () => {
      const start1: Pt = { x: -5, y: -5 };
      const end1: Pt = { x: -2, y: -1 }; // Length = 5
      const start2: Pt = { x: 10, y: 10 };
      const end2: Pt = { x: 13, y: 14 }; // Length = 5

      const constraint = sameLength('test', start1, end1, start2, end2);
      const error = constraint.calculateError(10);

      expect(error).toBeCloseTo(0, 10);
    });

    it('should be symmetric regardless of segment order', () => {
      const start1: Pt = { x: 0, y: 0 };
      const end1: Pt = { x: 3, y: 0 }; // Length = 3
      const start2: Pt = { x: 0, y: 0 };
      const end2: Pt = { x: 5, y: 0 }; // Length = 5

      const constraint1 = sameLength('test1', start1, end1, start2, end2);
      const constraint2 = sameLength('test2', start2, end2, start1, end1);

      const error1 = constraint1.calculateError(10);
      const error2 = constraint2.calculateError(10);

      expect(error1).toBeCloseTo(error2, 10);
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero-length segments', () => {
      const start1: Pt = { x: 5, y: 5 };
      const end1: Pt = { x: 5, y: 5 }; // Zero length
      const start2: Pt = { x: 0, y: 0 };
      const end2: Pt = { x: 3, y: 4 }; // Length = 5

      const constraint = sameLength('test', start1, end1, start2, end2);
      const error = constraint.calculateError(10);

      // Error should be |0-5|/10 = 0.5
      expect(error).toBeCloseTo(0.5, 10);
    });

    it('should handle both segments having zero length', () => {
      const start1: Pt = { x: 0, y: 0 };
      const end1: Pt = { x: 0, y: 0 }; // Zero length
      const start2: Pt = { x: 5, y: 5 };
      const end2: Pt = { x: 5, y: 5 }; // Zero length

      const constraint = sameLength('test', start1, end1, start2, end2);
      const error = constraint.calculateError(10);

      expect(error).toBeCloseTo(0, 10); // Both zero length = no difference
    });

    it('should handle very small length differences', () => {
      const start1: Pt = { x: 0, y: 0 };
      const end1: Pt = { x: 1, y: 0 }; // Length = 1
      const start2: Pt = { x: 0, y: 0 };
      const end2: Pt = { x: 1.000001, y: 0 }; // Length ≈ 1.000001

      const constraint = sameLength('test', start1, end1, start2, end2);
      const error = constraint.calculateError(1);

      expect(error).toBeCloseTo(0.000001, 6);
    });

    it('should handle very large coordinates', () => {
      const start1: Pt = { x: 1e6, y: 1e6 };
      const end1: Pt = { x: 1e6 + 3, y: 1e6 + 4 }; // Length = 5
      const start2: Pt = { x: 2e6, y: 2e6 };
      const end2: Pt = { x: 2e6 + 5, y: 2e6 + 12 }; // Length = 13

      const constraint = sameLength('test', start1, end1, start2, end2);
      const error = constraint.calculateError(20);

      // Error should be |5-13|/20 = 0.4
      expect(error).toBeCloseTo(0.4, 5);
    });

    it('should handle floating point precision issues', () => {
      const start1: Pt = { x: 0, y: 0 };
      const end1: Pt = { x: Math.sqrt(2), y: Math.sqrt(2) }; // Length = 2
      const start2: Pt = { x: 0, y: 0 };
      const end2: Pt = { x: 2, y: 0 }; // Length = 2

      const constraint = sameLength('test', start1, end1, start2, end2);
      const error = constraint.calculateError(1);

      // Should be very close to zero despite floating point arithmetic
      expect(error).toBeLessThan(1e-10);
    });
  });

  describe('Partial Derivatives', () => {
    it('should calculate partial derivative with respect to first segment start point', () => {
      const start1: Pt = { x: 0, y: 0 };
      const end1: Pt = { x: 3, y: 0 }; // Length = 3
      const start2: Pt = { x: 0, y: 0 };
      const end2: Pt = { x: 5, y: 0 }; // Length = 5

      const constraint = sameLength('test', start1, end1, start2, end2);
      const derivativeX = constraint.calculatePartialDerivative(
        0,
        'x',
        10,
        1e-6
      );

      // Moving start1.x should affect the length of first segment
      expect(typeof derivativeX).toBe('number');
      expect(Math.abs(derivativeX)).toBeGreaterThan(0);
    });

    it('should calculate partial derivative with respect to second segment', () => {
      const start1: Pt = { x: 0, y: 0 };
      const end1: Pt = { x: 3, y: 0 }; // Length = 3
      const start2: Pt = { x: 0, y: 0 };
      const end2: Pt = { x: 5, y: 0 }; // Length = 5

      const constraint = sameLength('test', start1, end1, start2, end2);
      const derivativeX = constraint.calculatePartialDerivative(
        2,
        'x',
        10,
        1e-6
      );

      // Moving start2.x should affect the length of second segment
      expect(typeof derivativeX).toBe('number');
      expect(Math.abs(derivativeX)).toBeGreaterThan(0);
    });

    it('should have opposite sign derivatives for balanced changes', () => {
      const start1: Pt = { x: 0, y: 0 };
      const end1: Pt = { x: 3, y: 0 }; // Length = 3
      const start2: Pt = { x: 0, y: 0 };
      const end2: Pt = { x: 5, y: 0 }; // Length = 5 (longer)

      const constraint = sameLength('test', start1, end1, start2, end2);

      // Derivatives for extending first segment vs second segment should have opposite effects
      const deriv1 = constraint.calculatePartialDerivative(1, 'x', 10, 1e-6); // end1.x
      const deriv2 = constraint.calculatePartialDerivative(3, 'x', 10, 1e-6); // end2.x

      // Since segment 2 is longer, extending it further should increase error,
      // while extending segment 1 should decrease error
      expect(deriv1 * deriv2).toBeLessThan(0);
    });

    it('should calculate consistent derivatives for symmetric changes', () => {
      const start1: Pt = { x: 0, y: 0 };
      const end1: Pt = { x: 5, y: 0 }; // Length = 5
      const start2: Pt = { x: 0, y: 0 };
      const end2: Pt = { x: 5, y: 0 }; // Length = 5 (equal)

      const constraint = sameLength('test', start1, end1, start2, end2);

      const deriv1 = constraint.calculatePartialDerivative(1, 'x', 10, 1e-6); // end1.x
      const deriv2 = constraint.calculatePartialDerivative(3, 'x', 10, 1e-6); // end2.x

      // For equal lengths, extending either segment should increase error equally
      // So derivatives should have the same sign and similar magnitudes
      expect(Math.abs(deriv1)).toBeCloseTo(Math.abs(deriv2), 3);
      expect(Math.sign(deriv1)).toBe(Math.sign(deriv2));
    });

    it("should handle zero derivative when point movement doesn't affect length", () => {
      const start1: Pt = { x: 0, y: 0 };
      const end1: Pt = { x: 5, y: 0 }; // Horizontal line
      const start2: Pt = { x: 0, y: 0 };
      const end2: Pt = { x: 3, y: 0 }; // Horizontal line

      const constraint = sameLength('test', start1, end1, start2, end2);

      // Moving start points perpendicular to line direction shouldn't change length much
      const derivY1 = constraint.calculatePartialDerivative(0, 'y', 10, 1e-6); // start1.y
      const derivY2 = constraint.calculatePartialDerivative(2, 'y', 10, 1e-6); // start2.y

      // Should be very small (ideally zero for pure horizontal movement)
      expect(Math.abs(derivY1)).toBeLessThan(1e-3);
      expect(Math.abs(derivY2)).toBeLessThan(1e-3);
    });
  });

  describe('Error Normalization', () => {
    it('should scale error proportionally to max expected error', () => {
      const start1: Pt = { x: 0, y: 0 };
      const end1: Pt = { x: 5, y: 0 }; // Length = 5
      const start2: Pt = { x: 0, y: 0 };
      const end2: Pt = { x: 10, y: 0 }; // Length = 10, difference = 5

      const constraint = sameLength('test', start1, end1, start2, end2);

      const error1 = constraint.calculateError(10); // max = 10
      const error2 = constraint.calculateError(20); // max = 20

      expect(error2).toBeCloseTo(error1 / 2, 10); // Should be half when max doubles
    });

    it('should handle very small max expected error', () => {
      const start1: Pt = { x: 0, y: 0 };
      const end1: Pt = { x: 5, y: 0 }; // Length = 5
      const start2: Pt = { x: 0, y: 0 };
      const end2: Pt = { x: 6, y: 0 }; // Length = 6, difference = 1

      const constraint = sameLength('test', start1, end1, start2, end2);
      const error = constraint.calculateError(0.1); // Very small max

      expect(error).toBe(1.0); // Should clamp to maximum
    });

    it('should handle very large max expected error', () => {
      const start1: Pt = { x: 0, y: 0 };
      const end1: Pt = { x: 5, y: 0 }; // Length = 5
      const start2: Pt = { x: 0, y: 0 };
      const end2: Pt = { x: 6, y: 0 }; // Length = 6, difference = 1

      const constraint = sameLength('test', start1, end1, start2, end2);
      const error = constraint.calculateError(1000); // Very large max

      expect(error).toBeCloseTo(0.001, 10); // 1/1000
    });
  });
});
