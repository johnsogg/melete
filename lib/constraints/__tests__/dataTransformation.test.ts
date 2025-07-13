/**
 * Tests for data transformation utilities (flatten/unflatten points)
 * Testing point collection conversion to column vectors for gradient descent
 */

import type { Pt } from '../../geom/types';
import { flattenPoints, unflattenPoints } from '../geometry';

describe('Data Transformation', () => {
  describe('Point Flattening', () => {
    it('should flatten a single point correctly', () => {
      const point: Pt = { x: 5, y: 10 };
      const flattened = flattenPoints([point]);

      expect(flattened.coordinates).toEqual([5, 10]);
      expect(flattened.pointMap.get(point)).toEqual([0, 1]);
      expect(flattened.indexMap.get(0)).toBe(point);
      expect(flattened.indexMap.get(1)).toBe(point);
    });

    it('should flatten multiple points correctly', () => {
      const p1: Pt = { x: 1, y: 2 };
      const p2: Pt = { x: 3, y: 4 };
      const p3: Pt = { x: 5, y: 6 };
      const flattened = flattenPoints([p1, p2, p3]);

      expect(flattened.coordinates).toEqual([1, 2, 3, 4, 5, 6]);
      expect(flattened.pointMap.get(p1)).toEqual([0, 1]);
      expect(flattened.pointMap.get(p2)).toEqual([2, 3]);
      expect(flattened.pointMap.get(p3)).toEqual([4, 5]);
    });

    it('should handle points with floating-point coordinates', () => {
      const point: Pt = { x: Math.PI, y: Math.E };
      const flattened = flattenPoints([point]);

      expect(flattened.coordinates[0]).toBeCloseTo(Math.PI, 10);
      expect(flattened.coordinates[1]).toBeCloseTo(Math.E, 10);
    });

    it('should handle empty point array', () => {
      const flattened = flattenPoints([]);

      expect(flattened.coordinates).toEqual([]);
      expect(flattened.pointMap.size).toBe(0);
      expect(flattened.indexMap.size).toBe(0);
    });

    it('should handle points with negative coordinates', () => {
      const point: Pt = { x: -10, y: -20 };
      const flattened = flattenPoints([point]);

      expect(flattened.coordinates).toEqual([-10, -20]);
    });
  });

  describe('Point Unflattening', () => {
    it('should unflatten back to original points', () => {
      const p1: Pt = { x: 1, y: 2 };
      const p2: Pt = { x: 3, y: 4 };
      const original = [p1, p2];

      const flattened = flattenPoints(original);
      // Modify the flattened coordinates
      flattened.coordinates[0] = 10; // p1.x
      flattened.coordinates[1] = 20; // p1.y
      flattened.coordinates[2] = 30; // p2.x
      flattened.coordinates[3] = 40; // p2.y

      unflattenPoints(flattened);

      expect(p1.x).toBe(10);
      expect(p1.y).toBe(20);
      expect(p2.x).toBe(30);
      expect(p2.y).toBe(40);
    });

    it('should preserve object references during unflatten', () => {
      const point: Pt = { x: 5, y: 10 };
      const originalRef = point;

      const flattened = flattenPoints([point]);
      flattened.coordinates[0] = 100;
      flattened.coordinates[1] = 200;

      unflattenPoints(flattened);

      expect(point).toBe(originalRef); // Same object reference
      expect(point.x).toBe(100);
      expect(point.y).toBe(200);
    });
  });

  describe('Round-trip Consistency', () => {
    it('should preserve data through flatten-unflatten cycle', () => {
      const p1: Pt = { x: Math.random() * 100, y: Math.random() * 100 };
      const p2: Pt = { x: Math.random() * 100, y: Math.random() * 100 };
      const p3: Pt = { x: Math.random() * 100, y: Math.random() * 100 };

      const originalX1 = p1.x,
        originalY1 = p1.y;
      const originalX2 = p2.x,
        originalY2 = p2.y;
      const originalX3 = p3.x,
        originalY3 = p3.y;

      const flattened = flattenPoints([p1, p2, p3]);
      unflattenPoints(flattened);

      expect(p1.x).toBeCloseTo(originalX1, 10);
      expect(p1.y).toBeCloseTo(originalY1, 10);
      expect(p2.x).toBeCloseTo(originalX2, 10);
      expect(p2.y).toBeCloseTo(originalY2, 10);
      expect(p3.x).toBeCloseTo(originalX3, 10);
      expect(p3.y).toBeCloseTo(originalY3, 10);
    });

    it('should handle multiple flatten-unflatten cycles', () => {
      const point: Pt = { x: 42, y: 24 };

      for (let i = 0; i < 5; i++) {
        const flattened = flattenPoints([point]);
        unflattenPoints(flattened);
      }

      expect(point.x).toBeCloseTo(42, 10);
      expect(point.y).toBeCloseTo(24, 10);
    });
  });

  describe('Shared Point Scenarios', () => {
    it('should handle shared points between constraints', () => {
      const sharedPoint: Pt = { x: 0, y: 0 };
      const p1: Pt = { x: 1, y: 1 };
      const p2: Pt = { x: 2, y: 2 };

      // Simulate two constraints sharing the same point
      const constraint1Points = [sharedPoint, p1];
      const constraint2Points = [sharedPoint, p2];

      const allPoints = Array.from(
        new Set([...constraint1Points, ...constraint2Points])
      );
      const flattened = flattenPoints(allPoints);

      // Should only have 3 unique points (not 4)
      expect(allPoints.length).toBe(3);
      expect(flattened.coordinates.length).toBe(6); // 3 points * 2 coordinates

      // Shared point should appear only once in the flattened representation
      const sharedIndices = flattened.pointMap.get(sharedPoint);
      expect(sharedIndices).toBeDefined();

      // Modify shared point
      if (sharedIndices) {
        flattened.coordinates[sharedIndices[0]] = 99;
        flattened.coordinates[sharedIndices[1]] = 88;
      }

      unflattenPoints(flattened);

      expect(sharedPoint.x).toBe(99);
      expect(sharedPoint.y).toBe(88);
    });

    it('should correctly map duplicate point references', () => {
      const point: Pt = { x: 5, y: 10 };
      // Same point referenced multiple times
      const points = [point, point, point];

      const flattened = flattenPoints(points);

      // Should deduplicate to single point
      expect(flattened.pointMap.size).toBe(1);
      expect(flattened.coordinates.length).toBe(2); // Only one point's coordinates
    });
  });

  describe('Edge Cases', () => {
    it('should handle points with zero coordinates', () => {
      const origin: Pt = { x: 0, y: 0 };
      const flattened = flattenPoints([origin]);

      expect(flattened.coordinates).toEqual([0, 0]);

      flattened.coordinates[0] = 1;
      flattened.coordinates[1] = 1;
      unflattenPoints(flattened);

      expect(origin.x).toBe(1);
      expect(origin.y).toBe(1);
    });

    it('should handle very large coordinate values', () => {
      const point: Pt = { x: 1e10, y: -1e10 };
      const flattened = flattenPoints([point]);

      expect(flattened.coordinates[0]).toBe(1e10);
      expect(flattened.coordinates[1]).toBe(-1e10);
    });

    it('should handle very small coordinate values', () => {
      const point: Pt = { x: 1e-10, y: -1e-10 };
      const flattened = flattenPoints([point]);

      expect(flattened.coordinates[0]).toBeCloseTo(1e-10, 15);
      expect(flattened.coordinates[1]).toBeCloseTo(-1e-10, 15);
    });
  });
});
