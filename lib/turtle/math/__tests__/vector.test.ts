/**
 * Unit tests for Vector3 operations
 */

import { Vector3 } from '../vector';

describe('Vector3', () => {
  describe('constructor and static methods', () => {
    it('should create vector with default values', () => {
      const v = new Vector3();
      expect(v.x).toBe(0);
      expect(v.y).toBe(0);
      expect(v.z).toBe(0);
    });

    it('should create vector with specified values', () => {
      const v = new Vector3(1, 2, 3);
      expect(v.x).toBe(1);
      expect(v.y).toBe(2);
      expect(v.z).toBe(3);
    });

    it('should create unit vectors', () => {
      expect(Vector3.unitX()).toEqual(new Vector3(1, 0, 0));
      expect(Vector3.unitY()).toEqual(new Vector3(0, 1, 0));
      expect(Vector3.unitZ()).toEqual(new Vector3(0, 0, 1));
    });

    it('should create zero vector', () => {
      expect(Vector3.zero()).toEqual(new Vector3(0, 0, 0));
    });
  });

  describe('basic operations', () => {
    it('should add vectors', () => {
      const a = new Vector3(1, 2, 3);
      const b = new Vector3(4, 5, 6);
      const result = a.add(b);
      
      expect(result).toEqual(new Vector3(5, 7, 9));
    });

    it('should subtract vectors', () => {
      const a = new Vector3(4, 5, 6);
      const b = new Vector3(1, 2, 3);
      const result = a.subtract(b);
      
      expect(result).toEqual(new Vector3(3, 3, 3));
    });

    it('should multiply by scalar', () => {
      const v = new Vector3(1, 2, 3);
      const result = v.multiply(2);
      
      expect(result).toEqual(new Vector3(2, 4, 6));
    });
  });

  describe('dot product', () => {
    it('should calculate dot product', () => {
      const a = new Vector3(1, 2, 3);
      const b = new Vector3(4, 5, 6);
      const result = a.dot(b);
      
      expect(result).toBe(32); // 1*4 + 2*5 + 3*6 = 32
    });

    it('should return zero for perpendicular vectors', () => {
      const a = Vector3.unitX();
      const b = Vector3.unitY();
      const result = a.dot(b);
      
      expect(result).toBe(0);
    });
  });

  describe('cross product', () => {
    it('should calculate cross product', () => {
      const a = new Vector3(1, 0, 0);
      const b = new Vector3(0, 1, 0);
      const result = a.cross(b);
      
      expect(result).toEqual(new Vector3(0, 0, 1));
    });

    it('should be anti-commutative', () => {
      const a = new Vector3(1, 2, 3);
      const b = new Vector3(4, 5, 6);
      const cross1 = a.cross(b);
      const cross2 = b.cross(a);
      
      expect(cross1).toEqual(cross2.multiply(-1));
    });

    it('should return zero for parallel vectors', () => {
      const a = new Vector3(1, 2, 3);
      const b = new Vector3(2, 4, 6);
      const result = a.cross(b);
      
      expect(result.length()).toBeCloseTo(0, 10);
    });
  });

  describe('length and normalization', () => {
    it('should calculate length', () => {
      const v = new Vector3(3, 4, 0);
      expect(v.length()).toBe(5);
    });

    it('should calculate squared length', () => {
      const v = new Vector3(3, 4, 0);
      expect(v.lengthSquared()).toBe(25);
    });

    it('should normalize vector', () => {
      const v = new Vector3(3, 4, 0);
      const normalized = v.normalize();
      
      expect(normalized.length()).toBeCloseTo(1, 10);
      expect(normalized.x).toBeCloseTo(0.6, 10);
      expect(normalized.y).toBeCloseTo(0.8, 10);
      expect(normalized.z).toBeCloseTo(0, 10);
    });

    it('should handle zero vector normalization', () => {
      const v = Vector3.zero();
      const normalized = v.normalize();
      
      expect(normalized).toEqual(Vector3.zero());
    });
  });

  describe('utility methods', () => {
    it('should clone vector', () => {
      const original = new Vector3(1, 2, 3);
      const cloned = original.clone();
      
      expect(cloned).toEqual(original);
      expect(cloned).not.toBe(original);
    });

    it('should check equality', () => {
      const a = new Vector3(1, 2, 3);
      const b = new Vector3(1, 2, 3);
      const c = new Vector3(1, 2, 4);
      
      expect(a.equals(b)).toBe(true);
      expect(a.equals(c)).toBe(false);
    });

    it('should handle epsilon tolerance in equality', () => {
      const a = new Vector3(1, 2, 3);
      const b = new Vector3(1.0000001, 2, 3);
      
      expect(a.equals(b, 1e-6)).toBe(true);
      expect(a.equals(b, 1e-8)).toBe(false);
    });

    it('should convert to Vec3 interface', () => {
      const v = new Vector3(1, 2, 3);
      const vec3 = v.toVec3();
      
      expect(vec3).toEqual({ x: 1, y: 2, z: 3 });
    });

    it('should create from Vec3 interface', () => {
      const vec3 = { x: 1, y: 2, z: 3 };
      const v = Vector3.from(vec3);
      
      expect(v).toEqual(new Vector3(1, 2, 3));
    });
  });
});