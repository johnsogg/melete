/**
 * Unit tests for turtle stack operations
 */

import { TurtleStack } from '../stack';
import { TurtleState } from '../state';

describe('TurtleStack', () => {
  let stack: TurtleStack;

  beforeEach(() => {
    stack = new TurtleStack();
  });

  describe('basic operations', () => {
    it('should start empty', () => {
      expect(stack.isEmpty()).toBe(true);
      expect(stack.size()).toBe(0);
    });

    it('should push and pop states', () => {
      const state1 = new TurtleState({ x: 10, y: 20, z: 0 });
      const state2 = new TurtleState({ x: 30, y: 40, z: 0 });

      stack.push(state1);
      expect(stack.isEmpty()).toBe(false);
      expect(stack.size()).toBe(1);

      stack.push(state2);
      expect(stack.size()).toBe(2);

      const popped2 = stack.pop();
      expect(popped2?.getPosition()).toEqual({ x: 30, y: 40, z: 0 });
      expect(stack.size()).toBe(1);

      const popped1 = stack.pop();
      expect(popped1?.getPosition()).toEqual({ x: 10, y: 20, z: 0 });
      expect(stack.isEmpty()).toBe(true);
    });

    it('should return undefined when popping from empty stack', () => {
      const result = stack.pop();
      expect(result).toBeUndefined();
    });

    it('should peek at top without removing', () => {
      const state = new TurtleState({ x: 5, y: 10, z: 0 });
      stack.push(state);

      const peeked = stack.peek();
      expect(peeked?.getPosition()).toEqual({ x: 5, y: 10, z: 0 });
      expect(stack.size()).toBe(1); // Should not have removed anything

      // Peek again to make sure it's still there
      const peeked2 = stack.peek();
      expect(peeked2?.getPosition()).toEqual({ x: 5, y: 10, z: 0 });
    });

    it('should return undefined when peeking at empty stack', () => {
      const result = stack.peek();
      expect(result).toBeUndefined();
    });

    it('should clear all states', () => {
      stack.push(new TurtleState({ x: 1, y: 2, z: 0 }));
      stack.push(new TurtleState({ x: 3, y: 4, z: 0 }));
      stack.push(new TurtleState({ x: 5, y: 6, z: 0 }));

      expect(stack.size()).toBe(3);

      stack.clear();

      expect(stack.isEmpty()).toBe(true);
      expect(stack.size()).toBe(0);
      expect(stack.peek()).toBeUndefined();
    });
  });

  describe('state independence', () => {
    it('should store independent copies of states', () => {
      const originalState = new TurtleState({ x: 100, y: 200, z: 0 });
      stack.push(originalState);

      // Modify the original state
      originalState.moveForward(50);

      // The state in the stack should be unchanged
      const retrievedState = stack.peek();
      expect(retrievedState?.getPosition()).toEqual({ x: 100, y: 200, z: 0 });
    });

    it('should return independent copies when popping', () => {
      const state = new TurtleState({ x: 10, y: 20, z: 0 });
      stack.push(state);

      const popped1 = stack.pop();
      const popped2 = stack.pop(); // This should be undefined

      expect(popped1).not.toBe(state); // Should be a different object
      expect(popped1?.getPosition()).toEqual(state.getPosition()); // But same values
      expect(popped2).toBeUndefined();
    });
  });

  describe('LIFO behavior', () => {
    it('should follow last-in-first-out order', () => {
      const states = [
        new TurtleState({ x: 1, y: 1, z: 0 }),
        new TurtleState({ x: 2, y: 2, z: 0 }),
        new TurtleState({ x: 3, y: 3, z: 0 }),
        new TurtleState({ x: 4, y: 4, z: 0 })
      ];

      // Push all states
      states.forEach(state => stack.push(state));

      // Pop them and verify LIFO order
      for (let i = states.length - 1; i >= 0; i--) {
        const popped = stack.pop();
        expect(popped?.getPosition()).toEqual(states[i].getPosition());
      }

      expect(stack.isEmpty()).toBe(true);
    });
  });
});