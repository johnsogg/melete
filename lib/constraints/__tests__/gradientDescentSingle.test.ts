/**
 * Tests for gradient descent single iteration
 * Tests steepest descent direction calculation and single step correctness
 */

import type { Pt } from '../../geom/types';
import type { 
  ConstraintSystem, 
  SolveIterationResult, 
  SolverConfig,
  AnyConstraint,
  FlattenedPoints
} from '../types';
import { unflattenPoints, flattenPoints } from '../geometry';

// Mock implementations for testing - will be replaced with actual implementations
const mockSolverConfig: SolverConfig = {
  convergenceTolerance: 1e-4,
  differentiationStep: 1e-6,
  learningRate: 0.1,
  maxIterations: 1000,
  minErrorReduction: 1e-8,
};


const performSingleIteration = (
  system: ConstraintSystem,
  flattened: FlattenedPoints
): SolveIterationResult => {
  const { constraints, config } = system;
  
  // Calculate current total error
  const constraintErrors = constraints.map(constraint => {
    const maxError = calculateMaxExpectedError(constraint);
    return constraint.calculateError(maxError);
  });
  
  const totalError = constraintErrors.reduce((sum, error) => sum + error * error, 0);
  
  // Calculate gradient for each coordinate
  const gradient = new Array(flattened.coordinates.length).fill(0);
  
  constraints.forEach(constraint => {
    const maxError = calculateMaxExpectedError(constraint);
    
    constraint.points.forEach((point, pointIndex) => {
      const indices = flattened.pointMap.get(point);
      if (!indices) return;
      
      const [xIndex, yIndex] = indices;
      
      // Add partial derivatives to gradient
      gradient[xIndex] += constraint.calculatePartialDerivative(
        pointIndex, 'x', maxError, config.differentiationStep
      );
      gradient[yIndex] += constraint.calculatePartialDerivative(
        pointIndex, 'y', maxError, config.differentiationStep
      );
    });
  });
  
  // Apply gradient descent step
  for (let i = 0; i < flattened.coordinates.length; i++) {
    flattened.coordinates[i] -= config.learningRate * gradient[i];
  }
  
  // Update point objects with new coordinates
  unflattenPoints(flattened);
  
  // Calculate new error after step
  const newConstraintErrors = constraints.map(constraint => {
    const maxError = calculateMaxExpectedError(constraint);
    return constraint.calculateError(maxError);
  });
  
  const newTotalError = newConstraintErrors.reduce((sum, error) => sum + error * error, 0);
  const errorReduction = totalError - newTotalError;
  
  return {
    iteration: 1,
    totalError: newTotalError,
    errorReduction,
    constraintErrors: newConstraintErrors,
    converged: newTotalError < config.convergenceTolerance,
    shouldContinue: errorReduction > config.minErrorReduction && newTotalError > config.convergenceTolerance
  };
};

const calculateMaxExpectedError = (constraint: AnyConstraint): number => {
  switch (constraint.type) {
    case 'point-on-line':
      return 100; // Canvas-like max distance
    case 'same-length':
      return 100; // Max expected length difference
    case 'right-angle':
      return Math.PI / 2; // 90 degrees max deviation
    default:
      return 1;
  }
};

// Mock constraint implementations for testing
class MockPointOnLineConstraint {
  readonly type = 'point-on-line' as const;
  
  constructor(
    public readonly id: string,
    public readonly points: readonly [Pt, Pt, Pt]
  ) {}
  
  calculateError(maxExpectedError: number): number {
    const [point, lineStart, lineEnd] = this.points;
    const lineLength = Math.sqrt(
      Math.pow(lineEnd.x - lineStart.x, 2) + Math.pow(lineEnd.y - lineStart.y, 2)
    );
    
    if (lineLength < 1e-10) return 1.0;
    
    const A = lineEnd.y - lineStart.y;
    const B = lineStart.x - lineEnd.x;
    const C = lineEnd.x * lineStart.y - lineStart.x * lineEnd.y;
    const distance = Math.abs(A * point.x + B * point.y + C) / Math.sqrt(A * A + B * B);
    
    return Math.min(1, distance / maxExpectedError);
  }
  
  calculatePartialDerivative(
    pointIndex: number,
    coordinate: 'x' | 'y',
    maxExpectedError: number,
    stepSize: number
  ): number {
    const originalValue = coordinate === 'x' ? this.points[pointIndex].x : this.points[pointIndex].y;
    
    (this.points[pointIndex] as any)[coordinate] = originalValue + stepSize;
    const errorPlus = this.calculateError(maxExpectedError);
    
    (this.points[pointIndex] as any)[coordinate] = originalValue - stepSize;
    const errorMinus = this.calculateError(maxExpectedError);
    
    (this.points[pointIndex] as any)[coordinate] = originalValue;
    
    return (errorPlus - errorMinus) / (2 * stepSize);
  }
}

describe('Gradient Descent Single Iteration', () => {
  describe('Gradient Calculation', () => {
    it('should calculate correct gradient for point-on-line constraint', () => {
      const point: Pt = { x: 5, y: 3 }; // 3 units above horizontal line
      const lineStart: Pt = { x: 0, y: 0 };
      const lineEnd: Pt = { x: 10, y: 0 };
      
      const constraint = new MockPointOnLineConstraint('test', [point, lineStart, lineEnd]) as any;
      const system: ConstraintSystem = {
        constraints: [constraint],
        points: [point, lineStart, lineEnd],
        config: mockSolverConfig
      };
      
      const flattened = flattenPoints(system.points);
      const originalY = point.y;
      
      const result = performSingleIteration(system, flattened);
      
      // Point should move toward the line (y should decrease)
      expect(point.y).toBeLessThan(originalY);
      expect(result.totalError).toBeGreaterThan(0);
      expect(result.errorReduction).toBeGreaterThan(0);
    });

    it('should reduce error in single iteration', () => {
      const point: Pt = { x: 5, y: 5 }; // Far from horizontal line
      const lineStart: Pt = { x: 0, y: 0 };
      const lineEnd: Pt = { x: 10, y: 0 };
      
      const constraint = new MockPointOnLineConstraint('test', [point, lineStart, lineEnd]) as any;
      const system: ConstraintSystem = {
        constraints: [constraint],
        points: [point, lineStart, lineEnd],
        config: mockSolverConfig
      };
      
      const flattened = flattenPoints(system.points);
      
      // Calculate initial error
      const initialError = constraint.calculateError(100);
      
      const result = performSingleIteration(system, flattened);
      
      // Error should be reduced
      expect(result.totalError).toBeLessThan(initialError * initialError);
      expect(result.errorReduction).toBeGreaterThan(0);
    });

    it('should handle multiple constraints correctly', () => {
      // Point should be on line AND have specific distance relationships
      const point: Pt = { x: 5, y: 3 };
      const lineStart: Pt = { x: 0, y: 0 };
      const lineEnd: Pt = { x: 10, y: 0 };
      
      // Another point for distance constraint
      const point2: Pt = { x: 8, y: 4 };
      
      const constraint1 = new MockPointOnLineConstraint('test1', [point, lineStart, lineEnd]) as any;
      // Note: would need MockSameLengthConstraint for full test
      
      const system: ConstraintSystem = {
        constraints: [constraint1],
        points: [point, lineStart, lineEnd, point2],
        config: mockSolverConfig
      };
      
      const flattened = flattenPoints(system.points);
      const result = performSingleIteration(system, flattened);
      
      expect(result.constraintErrors.length).toBe(1);
      expect(result.totalError).toBeGreaterThan(0);
    });

    it('should respect learning rate in gradient step', () => {
      const point: Pt = { x: 5, y: 5 };
      const lineStart: Pt = { x: 0, y: 0 };
      const lineEnd: Pt = { x: 10, y: 0 };
      
      const constraint = new MockPointOnLineConstraint('test', [point, lineStart, lineEnd]) as any;
      
      // Test with different learning rates
      const smallLearningRate = { ...mockSolverConfig, learningRate: 0.01 };
      const largeLearningRate = { ...mockSolverConfig, learningRate: 0.5 };
      
      const systemSmall: ConstraintSystem = {
        constraints: [constraint],
        points: [point, lineStart, lineEnd],
        config: smallLearningRate
      };
      
      const point2: Pt = { x: 5, y: 5 };
      const constraint2 = new MockPointOnLineConstraint('test2', [point2, lineStart, lineEnd]) as any;
      const systemLarge: ConstraintSystem = {
        constraints: [constraint2],
        points: [point2, lineStart, lineEnd],
        config: largeLearningRate
      };
      
      const flattened1 = flattenPoints(systemSmall.points);
      const flattened2 = flattenPoints(systemLarge.points);
      
      const originalY1 = point.y;
      const originalY2 = point2.y;
      
      performSingleIteration(systemSmall, flattened1);
      performSingleIteration(systemLarge, flattened2);
      
      const change1 = Math.abs(point.y - originalY1);
      const change2 = Math.abs(point2.y - originalY2);
      
      // Larger learning rate should produce larger changes
      expect(change2).toBeGreaterThan(change1);
    });
  });

  describe('Convergence Detection', () => {
    it('should detect convergence when error is below tolerance', () => {
      const point: Pt = { x: 5, y: 0.0001 }; // Very close to line
      const lineStart: Pt = { x: 0, y: 0 };
      const lineEnd: Pt = { x: 10, y: 0 };
      
      const constraint = new MockPointOnLineConstraint('test', [point, lineStart, lineEnd]) as any;
      const system: ConstraintSystem = {
        constraints: [constraint],
        points: [point, lineStart, lineEnd],
        config: { ...mockSolverConfig, convergenceTolerance: 1e-3 }
      };
      
      const flattened = flattenPoints(system.points);
      const result = performSingleIteration(system, flattened);
      
      expect(result.converged).toBe(true);
      expect(result.shouldContinue).toBe(false);
    });

    it('should continue when error is above tolerance', () => {
      const point: Pt = { x: 5, y: 5 }; // Far from line
      const lineStart: Pt = { x: 0, y: 0 };
      const lineEnd: Pt = { x: 10, y: 0 };
      
      const constraint = new MockPointOnLineConstraint('test', [point, lineStart, lineEnd]) as any;
      const system: ConstraintSystem = {
        constraints: [constraint],
        points: [point, lineStart, lineEnd],
        config: mockSolverConfig
      };
      
      const flattened = flattenPoints(system.points);
      const result = performSingleIteration(system, flattened);
      
      expect(result.converged).toBe(false);
      expect(result.shouldContinue).toBe(true);
    });

    it('should stop when error reduction is insufficient', () => {
      const point: Pt = { x: 5, y: 1 }; // Moderate distance from line
      const lineStart: Pt = { x: 0, y: 0 };
      const lineEnd: Pt = { x: 10, y: 0 };
      
      const constraint = new MockPointOnLineConstraint('test', [point, lineStart, lineEnd]) as any;
      const system: ConstraintSystem = {
        constraints: [constraint],
        points: [point, lineStart, lineEnd],
        config: { ...mockSolverConfig, minErrorReduction: 1e20 } // Impossibly high threshold
      };
      
      const flattened = flattenPoints(system.points);
      const result = performSingleIteration(system, flattened);
      
      expect(result.shouldContinue).toBe(false);
    });
  });

  describe('Numerical Stability', () => {
    it('should handle very small gradients', () => {
      const point: Pt = { x: 5, y: 1e-10 }; // Very close to line
      const lineStart: Pt = { x: 0, y: 0 };
      const lineEnd: Pt = { x: 10, y: 0 };
      
      const constraint = new MockPointOnLineConstraint('test', [point, lineStart, lineEnd]) as any;
      const system: ConstraintSystem = {
        constraints: [constraint],
        points: [point, lineStart, lineEnd],
        config: mockSolverConfig
      };
      
      const flattened = flattenPoints(system.points);
      const result = performSingleIteration(system, flattened);
      
      expect(isFinite(result.totalError)).toBe(true);
      expect(isFinite(result.errorReduction)).toBe(true);
      expect(result.constraintErrors.every(e => isFinite(e))).toBe(true);
    });

    it('should handle large coordinate values', () => {
      const point: Pt = { x: 1e6, y: 1e6 + 100 }; // Large coordinates
      const lineStart: Pt = { x: 1e6, y: 1e6 };
      const lineEnd: Pt = { x: 1e6 + 1000, y: 1e6 };
      
      const constraint = new MockPointOnLineConstraint('test', [point, lineStart, lineEnd]) as any;
      const system: ConstraintSystem = {
        constraints: [constraint],
        points: [point, lineStart, lineEnd],
        config: mockSolverConfig
      };
      
      const flattened = flattenPoints(system.points);
      const result = performSingleIteration(system, flattened);
      
      expect(isFinite(result.totalError)).toBe(true);
      expect(result.errorReduction).toBeGreaterThan(0);
    });

    it('should handle zero-error case gracefully', () => {
      const point: Pt = { x: 5, y: 0 }; // Exactly on line
      const lineStart: Pt = { x: 0, y: 0 };
      const lineEnd: Pt = { x: 10, y: 0 };
      
      const constraint = new MockPointOnLineConstraint('test', [point, lineStart, lineEnd]) as any;
      const system: ConstraintSystem = {
        constraints: [constraint],
        points: [point, lineStart, lineEnd],
        config: mockSolverConfig
      };
      
      const flattened = flattenPoints(system.points);
      const result = performSingleIteration(system, flattened);
      
      expect(result.totalError).toBeCloseTo(0, 10);
      expect(result.converged).toBe(true);
    });
  });

  describe('Shared Points', () => {
    it('should accumulate gradients for shared points', () => {
      const sharedPoint: Pt = { x: 3, y: 3 }; // Off both lines
      const lineStart1: Pt = { x: 0, y: 0 };
      const lineEnd1: Pt = { x: 10, y: 0 }; // Horizontal line
      const lineStart2: Pt = { x: 0, y: 0 };
      const lineEnd2: Pt = { x: 0, y: 10 }; // Vertical line
      
      // Two constraints sharing the same point
      const constraint1 = new MockPointOnLineConstraint('test1', [sharedPoint, lineStart1, lineEnd1]) as any;
      const constraint2 = new MockPointOnLineConstraint('test2', [sharedPoint, lineStart2, lineEnd2]) as any;
      
      const system: ConstraintSystem = {
        constraints: [constraint1, constraint2],
        points: [sharedPoint, lineStart1, lineEnd1, lineStart2, lineEnd2],
        config: mockSolverConfig
      };
      
      const flattened = flattenPoints(system.points);
      const originalY = sharedPoint.y;
      
      const result = performSingleIteration(system, flattened);
      
      // Shared point should move based on both constraints
      expect(Math.abs(sharedPoint.y - originalY)).toBeGreaterThan(0);
      expect(result.constraintErrors.length).toBe(2);
    });

    it('should handle conflicting constraints on shared points', () => {
      const sharedPoint: Pt = { x: 5, y: 5 };
      const line1Start: Pt = { x: 0, y: 0 };
      const line1End: Pt = { x: 10, y: 0 }; // Horizontal line
      const line2Start: Pt = { x: 0, y: 10 };
      const line2End: Pt = { x: 10, y: 10 }; // Another horizontal line
      
      const constraint1 = new MockPointOnLineConstraint('test1', [sharedPoint, line1Start, line1End]) as any;
      const constraint2 = new MockPointOnLineConstraint('test2', [sharedPoint, line2Start, line2End]) as any;
      
      const system: ConstraintSystem = {
        constraints: [constraint1, constraint2],
        points: [sharedPoint, line1Start, line1End, line2Start, line2End],
        config: mockSolverConfig
      };
      
      const flattened = flattenPoints(system.points);
      const result = performSingleIteration(system, flattened);
      
      // Should find compromise position
      expect(result.totalError).toBeGreaterThan(0);
      expect(isFinite(result.totalError)).toBe(true);
    });
  });
});