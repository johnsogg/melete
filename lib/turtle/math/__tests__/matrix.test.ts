/**
 * Unit tests for Matrix4 operations
 */

import { Matrix4 } from '../matrix';

describe('Matrix4', () => {
  describe('identity', () => {
    it('should create identity matrix', () => {
      const identity = Matrix4.identity();
      const expected = [
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
      ];
      expect(identity.data).toEqual(expected);
    });
  });

  describe('translation', () => {
    it('should create translation matrix for 2D', () => {
      const translation = Matrix4.translation(10, 20);
      const expected = [
        1, 0, 0, 10,
        0, 1, 0, 20,
        0, 0, 1, 0,
        0, 0, 0, 1
      ];
      expect(translation.data).toEqual(expected);
    });

    it('should create translation matrix for 3D', () => {
      const translation = Matrix4.translation(10, 20, 30);
      const expected = [
        1, 0, 0, 10,
        0, 1, 0, 20,
        0, 0, 1, 30,
        0, 0, 0, 1
      ];
      expect(translation.data).toEqual(expected);
    });
  });

  describe('rotation matrices', () => {
    it('should create X rotation matrix', () => {
      const rotation = Matrix4.rotationX(Math.PI / 2);
      const expected = [
        1, 0, 0, 0,
        0, 0, -1, 0,
        0, 1, 0, 0,
        0, 0, 0, 1
      ];
      
      for (let i = 0; i < 16; i++) {
        expect(rotation.data[i]).toBeCloseTo(expected[i], 10);
      }
    });

    it('should create Y rotation matrix', () => {
      const rotation = Matrix4.rotationY(Math.PI / 2);
      const expected = [
        0, 0, 1, 0,
        0, 1, 0, 0,
        -1, 0, 0, 0,
        0, 0, 0, 1
      ];
      
      for (let i = 0; i < 16; i++) {
        expect(rotation.data[i]).toBeCloseTo(expected[i], 10);
      }
    });

    it('should create Z rotation matrix', () => {
      const rotation = Matrix4.rotationZ(Math.PI / 2);
      const expected = [
        0, -1, 0, 0,
        1, 0, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
      ];
      
      for (let i = 0; i < 16; i++) {
        expect(rotation.data[i]).toBeCloseTo(expected[i], 10);
      }
    });
  });

  describe('multiply', () => {
    it('should multiply matrices correctly', () => {
      const a = Matrix4.translation(10, 20, 0);
      const b = Matrix4.rotationZ(Math.PI / 2);
      const result = a.multiply(b);

      const expected = [
        0, -1, 0, 10,
        1, 0, 0, 20,
        0, 0, 1, 0,
        0, 0, 0, 1
      ];

      for (let i = 0; i < 16; i++) {
        expect(result.data[i]).toBeCloseTo(expected[i], 10);
      }
    });

    it('should satisfy identity property', () => {
      const matrix = Matrix4.translation(5, 10, 15);
      const identity = Matrix4.identity();
      
      const result1 = matrix.multiply(identity);
      const result2 = identity.multiply(matrix);
      
      expect(result1.equals(matrix)).toBe(true);
      expect(result2.equals(matrix)).toBe(true);
    });
  });

  describe('clone', () => {
    it('should create independent copy', () => {
      const original = Matrix4.translation(1, 2, 3);
      const cloned = original.clone();
      
      expect(cloned.equals(original)).toBe(true);
      expect(cloned).not.toBe(original);
      expect(cloned.data).not.toBe(original.data);
    });
  });

  describe('equals', () => {
    it('should return true for identical matrices', () => {
      const a = Matrix4.translation(1, 2, 3);
      const b = Matrix4.translation(1, 2, 3);
      expect(a.equals(b)).toBe(true);
    });

    it('should return false for different matrices', () => {
      const a = Matrix4.translation(1, 2, 3);
      const b = Matrix4.translation(1, 2, 4);
      expect(a.equals(b)).toBe(false);
    });

    it('should handle epsilon tolerance', () => {
      const a = new Matrix4([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
      const b = new Matrix4([1.0000001, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
      
      expect(a.equals(b, 1e-6)).toBe(true);
      expect(a.equals(b, 1e-8)).toBe(false);
    });
  });

  describe('getTranslation', () => {
    it('should extract translation components', () => {
      const matrix = Matrix4.translation(10, 20, 30);
      const translation = matrix.getTranslation();
      
      expect(translation).toEqual({ x: 10, y: 20, z: 30 });
    });
  });
});