/**
 * Tests for point-on-line constraint error function
 * Tests error calculation, range bounds [0,1], and edge cases
 */

import type { Pt } from '../../geom/types';
import type { PointOnLineConstraint } from '../types';

// Mock implementation for testing - will be replaced with actual implementation
class MockPointOnLineConstraint implements PointOnLineConstraint {
  readonly type = 'point-on-line' as const;
  
  constructor(
    public readonly id: string,
    public readonly points: readonly [Pt, Pt, Pt]
  ) {}
  
  calculateError(maxExpectedError: number): number {
    const [point, lineStart, lineEnd] = this.points;
    
    // Handle degenerate line case
    const lineLength = Math.sqrt(
      Math.pow(lineEnd.x - lineStart.x, 2) + Math.pow(lineEnd.y - lineStart.y, 2)
    );
    
    if (lineLength < 1e-10) {
      // Degenerate line - return maximum error
      return 1.0;
    }
    
    // Calculate perpendicular distance from point to line
    const A = lineEnd.y - lineStart.y;
    const B = lineStart.x - lineEnd.x;
    const C = lineEnd.x * lineStart.y - lineStart.x * lineEnd.y;
    
    const distance = Math.abs(A * point.x + B * point.y + C) / Math.sqrt(A * A + B * B);
    
    // Normalize to [0, 1] range
    return Math.min(1, distance / maxExpectedError);
  }
  
  calculatePartialDerivative(
    pointIndex: number,
    coordinate: 'x' | 'y',
    maxExpectedError: number,
    stepSize: number
  ): number {
    const originalValue = coordinate === 'x' ? this.points[pointIndex].x : this.points[pointIndex].y;
    
    // Calculate f(x + h)
    (this.points[pointIndex] as any)[coordinate] = originalValue + stepSize;
    const errorPlus = this.calculateError(maxExpectedError);
    
    // Calculate f(x - h)
    (this.points[pointIndex] as any)[coordinate] = originalValue - stepSize;
    const errorMinus = this.calculateError(maxExpectedError);
    
    // Restore original value
    (this.points[pointIndex] as any)[coordinate] = originalValue;
    
    // Return numerical derivative: (f(x+h) - f(x-h)) / (2h)
    return (errorPlus - errorMinus) / (2 * stepSize);
  }
}

describe('Point-on-Line Constraint', () => {
  describe('Error Calculation', () => {
    it('should return zero error when point is exactly on line', () => {
      const lineStart: Pt = { x: 0, y: 0 };
      const lineEnd: Pt = { x: 10, y: 0 };
      const pointOnLine: Pt = { x: 5, y: 0 }; // Exactly on the line
      
      const constraint = new MockPointOnLineConstraint('test', [pointOnLine, lineStart, lineEnd]);
      const error = constraint.calculateError(100);
      
      expect(error).toBeCloseTo(0, 10);
    });

    it('should calculate correct perpendicular distance', () => {
      const lineStart: Pt = { x: 0, y: 0 };
      const lineEnd: Pt = { x: 10, y: 0 };
      const point: Pt = { x: 5, y: 3 }; // 3 units above the line
      
      const constraint = new MockPointOnLineConstraint('test', [point, lineStart, lineEnd]);
      const maxError = 10;
      const error = constraint.calculateError(maxError);
      
      // Error should be 3/10 = 0.3 (normalized)
      expect(error).toBeCloseTo(0.3, 10);
    });

    it('should handle diagonal lines correctly', () => {
      const lineStart: Pt = { x: 0, y: 0 };
      const lineEnd: Pt = { x: 3, y: 4 }; // 3-4-5 triangle, length = 5
      const point: Pt = { x: 4, y: -1 }; // Point off the line
      
      const constraint = new MockPointOnLineConstraint('test', [point, lineStart, lineEnd]);
      const error = constraint.calculateError(10);
      
      // Should calculate perpendicular distance using line equation
      expect(error).toBeGreaterThan(0);
      expect(error).toBeLessThanOrEqual(1);
    });

    it('should return bounded error in range [0, 1]', () => {
      const lineStart: Pt = { x: 0, y: 0 };
      const lineEnd: Pt = { x: 1, y: 0 };
      const point: Pt = { x: 0, y: 1000 }; // Very far from line
      
      const constraint = new MockPointOnLineConstraint('test', [point, lineStart, lineEnd]);
      const error = constraint.calculateError(100); // max expected error much smaller than actual
      
      expect(error).toBe(1.0); // Should be clamped to 1
    });

    it('should handle negative coordinates', () => {
      const lineStart: Pt = { x: -5, y: -5 };
      const lineEnd: Pt = { x: 5, y: 5 };
      const point: Pt = { x: 0, y: 2 }; // Off the diagonal line
      
      const constraint = new MockPointOnLineConstraint('test', [point, lineStart, lineEnd]);
      const error = constraint.calculateError(10);
      
      expect(error).toBeGreaterThan(0);
      expect(error).toBeLessThanOrEqual(1);
    });
  });

  describe('Edge Cases', () => {
    it('should handle degenerate line (zero length)', () => {
      const lineStart: Pt = { x: 5, y: 5 };
      const lineEnd: Pt = { x: 5, y: 5 }; // Same point = zero length line
      const point: Pt = { x: 10, y: 10 };
      
      const constraint = new MockPointOnLineConstraint('test', [point, lineStart, lineEnd]);
      const error = constraint.calculateError(100);
      
      // Should return maximum error for degenerate line
      expect(error).toBe(1.0);
    });

    it('should handle very small line lengths', () => {
      const lineStart: Pt = { x: 0, y: 0 };
      const lineEnd: Pt = { x: 1e-12, y: 1e-12 }; // Tiny line
      const point: Pt = { x: 1, y: 1 };
      
      const constraint = new MockPointOnLineConstraint('test', [point, lineStart, lineEnd]);
      const error = constraint.calculateError(10);
      
      // Should handle as degenerate line
      expect(error).toBe(1.0);
    });

    it('should handle point coincident with line start', () => {
      const lineStart: Pt = { x: 0, y: 0 };
      const lineEnd: Pt = { x: 10, y: 0 };
      const point: Pt = { x: 0, y: 0 }; // Same as line start
      
      const constraint = new MockPointOnLineConstraint('test', [point, lineStart, lineEnd]);
      const error = constraint.calculateError(100);
      
      expect(error).toBeCloseTo(0, 10);
    });

    it('should handle point coincident with line end', () => {
      const lineStart: Pt = { x: 0, y: 0 };
      const lineEnd: Pt = { x: 10, y: 0 };
      const point: Pt = { x: 10, y: 0 }; // Same as line end
      
      const constraint = new MockPointOnLineConstraint('test', [point, lineStart, lineEnd]);
      const error = constraint.calculateError(100);
      
      expect(error).toBeCloseTo(0, 10);
    });

    it('should handle very large coordinates', () => {
      const lineStart: Pt = { x: 1e6, y: 1e6 };
      const lineEnd: Pt = { x: 2e6, y: 1e6 };
      const point: Pt = { x: 1.5e6, y: 1e6 + 1000 }; // 1000 units off line
      
      const constraint = new MockPointOnLineConstraint('test', [point, lineStart, lineEnd]);
      const error = constraint.calculateError(10000);
      
      expect(error).toBeCloseTo(0.1, 5); // 1000/10000 = 0.1
    });
  });

  describe('Partial Derivatives', () => {
    it('should calculate partial derivative with respect to point x-coordinate', () => {
      const lineStart: Pt = { x: 0, y: 0 };
      const lineEnd: Pt = { x: 10, y: 0 };
      const point: Pt = { x: 5, y: 3 };
      
      const constraint = new MockPointOnLineConstraint('test', [point, lineStart, lineEnd]);
      const derivative = constraint.calculatePartialDerivative(0, 'x', 10, 1e-6);
      
      // For horizontal line, moving point horizontally shouldn't change distance
      expect(Math.abs(derivative)).toBeLessThan(1e-3);
    });

    it('should calculate partial derivative with respect to point y-coordinate', () => {
      const lineStart: Pt = { x: 0, y: 0 };
      const lineEnd: Pt = { x: 10, y: 0 };
      const point: Pt = { x: 5, y: 3 };
      
      const constraint = new MockPointOnLineConstraint('test', [point, lineStart, lineEnd]);
      const derivative = constraint.calculatePartialDerivative(0, 'y', 10, 1e-6);
      
      // For horizontal line, moving point vertically should increase/decrease distance
      expect(Math.abs(derivative)).toBeGreaterThan(0);
    });

    it('should calculate partial derivative with respect to line start coordinates', () => {
      const lineStart: Pt = { x: 0, y: 0 };
      const lineEnd: Pt = { x: 10, y: 0 };
      const point: Pt = { x: 5, y: 3 };
      
      const constraint = new MockPointOnLineConstraint('test', [point, lineStart, lineEnd]);
      
      const derivativeX = constraint.calculatePartialDerivative(1, 'x', 10, 1e-6);
      const derivativeY = constraint.calculatePartialDerivative(1, 'y', 10, 1e-6);
      
      // Moving line start should affect the error
      expect(typeof derivativeX).toBe('number');
      expect(typeof derivativeY).toBe('number');
    });

    it('should maintain consistent sign for derivative direction', () => {
      const lineStart: Pt = { x: 0, y: 0 };
      const lineEnd: Pt = { x: 10, y: 0 };
      const point1: Pt = { x: 5, y: 3 }; // Above line
      const point2: Pt = { x: 5, y: -3 }; // Below line
      
      const constraint1 = new MockPointOnLineConstraint('test1', [point1, lineStart, lineEnd]);
      const constraint2 = new MockPointOnLineConstraint('test2', [point2, lineStart, lineEnd]);
      
      const derivative1 = constraint1.calculatePartialDerivative(0, 'y', 10, 1e-6);
      const derivative2 = constraint2.calculatePartialDerivative(0, 'y', 10, 1e-6);
      
      // Derivatives should have opposite signs for points on opposite sides
      expect(derivative1 * derivative2).toBeLessThan(0);
    });

    it('should handle numerical precision in derivatives', () => {
      const lineStart: Pt = { x: 0, y: 0 };
      const lineEnd: Pt = { x: 1, y: 1 };
      const point: Pt = { x: 0.5, y: 0.6 };
      
      const constraint = new MockPointOnLineConstraint('test', [point, lineStart, lineEnd]);
      
      // Test different step sizes
      const derivative1 = constraint.calculatePartialDerivative(0, 'x', 10, 1e-6);
      const derivative2 = constraint.calculatePartialDerivative(0, 'x', 10, 1e-8);
      
      // Should be reasonably close for different step sizes
      expect(Math.abs(derivative1 - derivative2)).toBeLessThan(0.1);
    });
  });

  describe('Error Normalization', () => {
    it('should scale error proportionally to max expected error', () => {
      const lineStart: Pt = { x: 0, y: 0 };
      const lineEnd: Pt = { x: 10, y: 0 };
      const point: Pt = { x: 5, y: 5 }; // 5 units from line
      
      const constraint = new MockPointOnLineConstraint('test', [point, lineStart, lineEnd]);
      
      const error1 = constraint.calculateError(10); // max = 10
      const error2 = constraint.calculateError(20); // max = 20
      
      expect(error2).toBeCloseTo(error1 / 2, 10); // Should be half when max doubles
    });

    it('should handle very small max expected error', () => {
      const lineStart: Pt = { x: 0, y: 0 };
      const lineEnd: Pt = { x: 10, y: 0 };
      const point: Pt = { x: 5, y: 1 }; // 1 unit from line
      
      const constraint = new MockPointOnLineConstraint('test', [point, lineStart, lineEnd]);
      const error = constraint.calculateError(0.1); // Very small max
      
      expect(error).toBe(1.0); // Should clamp to maximum
    });

    it('should handle very large max expected error', () => {
      const lineStart: Pt = { x: 0, y: 0 };
      const lineEnd: Pt = { x: 10, y: 0 };
      const point: Pt = { x: 5, y: 1 }; // 1 unit from line
      
      const constraint = new MockPointOnLineConstraint('test', [point, lineStart, lineEnd]);
      const error = constraint.calculateError(1000); // Very large max
      
      expect(error).toBeCloseTo(0.001, 10); // 1/1000
    });
  });
});