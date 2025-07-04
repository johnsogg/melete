/**
 * Unit tests for TurtleState class
 */

import { TurtleState } from '../state';
import { Vector3 } from '../math/vector';

describe('TurtleState', () => {
  describe('constructor', () => {
    it('should create turtle at origin facing up by default', () => {
      const turtle = new TurtleState();
      
      expect(turtle.getPosition()).toEqual({ x: 0, y: 0, z: 0 });
      expect(turtle.getForward().equals(Vector3.unitY())).toBe(true);
      expect(turtle.isPenDown()).toBe(true);
    });

    it('should create turtle at specified position', () => {
      const turtle = new TurtleState({ x: 10, y: 20, z: 30 });
      
      expect(turtle.getPosition()).toEqual({ x: 10, y: 20, z: 30 });
    });

    it('should create turtle with specified heading', () => {
      const heading = new Vector3(1, 0, 0);
      const turtle = new TurtleState({ x: 0, y: 0, z: 0 }, heading);
      
      expect(turtle.getForward().equals(Vector3.unitX())).toBe(true);
    });
  });

  describe('clone', () => {
    it('should create independent copy', () => {
      const original = new TurtleState({ x: 1, y: 2, z: 3 });
      original.setPenDown(false);
      original.moveForward(10);
      
      const cloned = original.clone();
      
      expect(cloned.getPosition()).toEqual(original.getPosition());
      expect(cloned.isPenDown()).toBe(original.isPenDown());
      expect(cloned).not.toBe(original);
      
      cloned.moveForward(5);
      expect(cloned.getPosition()).not.toEqual(original.getPosition());
    });
  });

  describe('pen state', () => {
    it('should manage pen up/down state', () => {
      const turtle = new TurtleState();
      
      expect(turtle.isPenDown()).toBe(true);
      
      turtle.setPenDown(false);
      expect(turtle.isPenDown()).toBe(false);
      
      turtle.setPenDown(true);
      expect(turtle.isPenDown()).toBe(true);
    });
  });

  describe('movement operations', () => {
    it('should move forward along heading direction', () => {
      const turtle = new TurtleState();
      turtle.moveForward(10);
      
      expect(turtle.getPosition()).toEqual({ x: 0, y: 10, z: 0 });
    });

    it('should move backward opposite to heading', () => {
      const turtle = new TurtleState();
      turtle.moveBackward(10);
      
      expect(turtle.getPosition()).toEqual({ x: 0, y: -10, z: 0 });
    });

    it('should move left relative to current orientation', () => {
      const turtle = new TurtleState();
      turtle.moveLeft(10);
      
      expect(turtle.getPosition().x).toBeCloseTo(-10, 10);
      expect(turtle.getPosition().y).toBeCloseTo(0, 10);
    });

    it('should move right relative to current orientation', () => {
      const turtle = new TurtleState();
      turtle.moveRight(10);
      
      expect(turtle.getPosition().x).toBeCloseTo(10, 10);
      expect(turtle.getPosition().y).toBeCloseTo(0, 10);
    });

    it('should move up in Z direction', () => {
      const turtle = new TurtleState();
      turtle.moveUp(10);
      
      expect(turtle.getPosition()).toEqual({ x: 0, y: 0, z: 10 });
    });

    it('should move down in negative Z direction', () => {
      const turtle = new TurtleState();
      turtle.moveDown(10);
      
      expect(turtle.getPosition()).toEqual({ x: 0, y: 0, z: -10 });
    });
  });

  describe('rotation operations', () => {
    it('should turn left (counterclockwise)', () => {
      const turtle = new TurtleState();
      turtle.turnLeft(Math.PI / 2);
      
      const forward = turtle.getForward();
      expect(forward.x).toBeCloseTo(-1, 10);
      expect(forward.y).toBeCloseTo(0, 10);
      expect(forward.z).toBeCloseTo(0, 10);
    });

    it('should turn right (clockwise)', () => {
      const turtle = new TurtleState();
      turtle.turnRight(Math.PI / 2);
      
      const forward = turtle.getForward();
      expect(forward.x).toBeCloseTo(1, 10);
      expect(forward.y).toBeCloseTo(0, 10);
      expect(forward.z).toBeCloseTo(0, 10);
    });

    it('should pitch up/down', () => {
      const turtle = new TurtleState();
      turtle.pitch(Math.PI / 2);
      
      const forward = turtle.getForward();
      expect(forward.x).toBeCloseTo(0, 10);
      expect(forward.y).toBeCloseTo(0, 10);
      expect(forward.z).toBeCloseTo(1, 10);
    });

    it('should roll around forward axis', () => {
      const turtle = new TurtleState();
      const originalUp = turtle.getUp();
      const originalRight = turtle.getRight();
      
      turtle.roll(Math.PI / 2);
      
      const newUp = turtle.getUp();
      const newRight = turtle.getRight();
      
      // After rolling 90 degrees around forward (Y), rotation is: Z->X, X->-Z
      expect(newUp.equals(originalRight, 0.001)).toBe(true);
      expect(newRight.equals(originalUp.multiply(-1), 0.001)).toBe(true);
      expect(turtle.getForward().equals(Vector3.unitY(), 0.001)).toBe(true);
    });
  });

  describe('combined operations', () => {
    it('should handle sequence of moves and turns', () => {
      const turtle = new TurtleState();
      
      turtle.moveForward(10);
      turtle.turnLeft(Math.PI / 2);
      turtle.moveForward(5);
      
      const pos = turtle.getPosition();
      expect(pos.x).toBeCloseTo(-5, 10);
      expect(pos.y).toBeCloseTo(10, 10);
      expect(pos.z).toBeCloseTo(0, 10);
    });

    it('should maintain orthonormal basis after rotations', () => {
      const turtle = new TurtleState();
      
      turtle.turnLeft(0.3);
      turtle.pitch(0.4);
      turtle.roll(0.5);
      
      const forward = turtle.getForward();
      const up = turtle.getUp();
      const right = turtle.getRight();
      
      expect(forward.length()).toBeCloseTo(1, 10);
      expect(up.length()).toBeCloseTo(1, 10);
      expect(right.length()).toBeCloseTo(1, 10);
      
      expect(forward.dot(up)).toBeCloseTo(0, 10);
      expect(forward.dot(right)).toBeCloseTo(0, 10);
      expect(up.dot(right)).toBeCloseTo(0, 10);
      
      expect(forward.cross(up).equals(right, 0.001)).toBe(true);
    });
  });

  describe('transformation matrix', () => {
    it('should generate correct transformation matrix', () => {
      const turtle = new TurtleState({ x: 10, y: 20, z: 30 });
      const matrix = turtle.getTransformationMatrix();
      
      const translation = matrix.getTranslation();
      expect(translation).toEqual({ x: 10, y: 20, z: 30 });
    });

    it('should generate identity-like matrix for default turtle', () => {
      const turtle = new TurtleState();
      const matrix = turtle.getTransformationMatrix();
      
      const expectedBasis = [
        1, 0, 0, 0,  // right = (1,0,0)
        0, 0, 1, 0,  // up = (0,0,1)  
        0, 1, 0, 0,  // forward = (0,1,0)
        0, 0, 0, 1   // homogeneous row
      ];
      
      for (let i = 0; i < 16; i++) {
        expect(matrix.data[i]).toBeCloseTo(expectedBasis[i], 10);
      }
    });
  });
});