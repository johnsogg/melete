/**
 * Unit tests for turtle command system
 */

import {
  turtleAngleUnits,
  turtlePenUp,
  turtlePenDown,
  turtleMove,
  turtleTurn,
  turtleLeft,
  turtleRight,
  TurtleMoveCommand,
  TurtleTurnCommand,
} from '../commands';
import { TurtleState } from '../state';

describe('Turtle Commands', () => {
  let state: TurtleState;

  beforeEach(() => {
    state = new TurtleState();
  });

  describe('pen commands', () => {
    it('should lift pen with turtlePenUp', () => {
      const command = turtlePenUp();
      command.execute(state);
      expect(state.isPenDown()).toBe(false);
    });

    it('should lower pen with turtlePenDown', () => {
      state.setPenDown(false);
      const command = turtlePenDown();
      command.execute(state);
      expect(state.isPenDown()).toBe(true);
    });
  });

  describe('move commands', () => {
    it('should move forward', () => {
      const command = turtleMove({ forward: 10 });
      command.execute(state);
      const pos = state.getPosition();
      expect(pos.x).toBeCloseTo(0, 10);
      expect(pos.y).toBeCloseTo(10, 10);
      expect(pos.z).toBeCloseTo(0, 10);
    });

    it('should move backward', () => {
      const command = turtleMove({ backward: 10 });
      command.execute(state);
      const pos = state.getPosition();
      expect(pos.x).toBeCloseTo(0, 10);
      expect(pos.y).toBeCloseTo(-10, 10);
      expect(pos.z).toBeCloseTo(0, 10);
    });

    it('should move left', () => {
      const command = turtleMove({ left: 10 });
      command.execute(state);
      const pos = state.getPosition();
      expect(pos.x).toBeCloseTo(-10, 10);
      expect(pos.y).toBeCloseTo(0, 10);
      expect(pos.z).toBeCloseTo(0, 10);
    });

    it('should move right', () => {
      const command = turtleMove({ right: 10 });
      command.execute(state);
      const pos = state.getPosition();
      expect(pos.x).toBeCloseTo(10, 10);
      expect(pos.y).toBeCloseTo(0, 10);
      expect(pos.z).toBeCloseTo(0, 10);
    });

    it('should move up', () => {
      const command = turtleMove({ up: 10 });
      command.execute(state);
      const pos = state.getPosition();
      expect(pos.x).toBeCloseTo(0, 10);
      expect(pos.y).toBeCloseTo(0, 10);
      expect(pos.z).toBeCloseTo(10, 10);
    });

    it('should move down', () => {
      const command = turtleMove({ down: 10 });
      command.execute(state);
      const pos = state.getPosition();
      expect(pos.x).toBeCloseTo(0, 10);
      expect(pos.y).toBeCloseTo(0, 10);
      expect(pos.z).toBeCloseTo(-10, 10);
    });

    it('should warn when multiple directions specified', () => {
      const originalWarn = console.warn;
      const warnings: string[] = [];
      console.warn = (message: string) => warnings.push(message);

      new TurtleMoveCommand({ forward: 10, backward: 5 });
      expect(
        warnings.some(w => w.includes('Multiple movement directions specified'))
      ).toBe(true);

      console.warn = originalWarn;
    });

    it('should warn when no direction specified', () => {
      const originalWarn = console.warn;
      const warnings: string[] = [];
      console.warn = (message: string) => warnings.push(message);

      new TurtleMoveCommand({});
      expect(
        warnings.some(w => w.includes('No movement direction specified'))
      ).toBe(true);

      console.warn = originalWarn;
    });
  });

  describe('turn commands', () => {
    it('should turn left with radians', () => {
      const command = turtleTurn({ left: Math.PI / 2 });
      command.execute(state);
      const forward = state.getForward();
      expect(forward.x).toBeCloseTo(-1, 10);
      expect(forward.y).toBeCloseTo(0, 10);
    });

    it('should turn right with radians', () => {
      const command = turtleTurn({ right: Math.PI / 2 });
      command.execute(state);
      const forward = state.getForward();
      expect(forward.x).toBeCloseTo(1, 10);
      expect(forward.y).toBeCloseTo(0, 10);
    });

    it('should turn left with degrees', () => {
      const command = turtleTurn({ left: 90, units: 'degrees' });
      command.execute(state);
      const forward = state.getForward();
      expect(forward.x).toBeCloseTo(-1, 10);
      expect(forward.y).toBeCloseTo(0, 10);
    });

    it('should handle pitch', () => {
      const command = turtleTurn({ pitch: Math.PI / 2 });
      command.execute(state);
      const forward = state.getForward();
      expect(forward.x).toBeCloseTo(0, 10);
      expect(forward.y).toBeCloseTo(0, 10);
      expect(forward.z).toBeCloseTo(1, 10);
    });

    it('should handle yaw (equivalent to left turn)', () => {
      const command = turtleTurn({ yaw: Math.PI / 2 });
      command.execute(state);
      const forward = state.getForward();
      expect(forward.x).toBeCloseTo(-1, 10);
      expect(forward.y).toBeCloseTo(0, 10);
    });

    it('should handle roll', () => {
      const command = turtleTurn({ roll: Math.PI / 2 });
      command.execute(state);
      const up = state.getUp();
      const right = state.getRight();
      expect(up.x).toBeCloseTo(1, 10);
      expect(right.z).toBeCloseTo(-1, 10);
    });

    it('should warn when multiple directions specified', () => {
      const originalWarn = console.warn;
      const warnings: string[] = [];
      console.warn = (message: string) => warnings.push(message);

      new TurtleTurnCommand({ left: 45, right: 30 });
      expect(
        warnings.some(w => w.includes('Multiple turn directions specified'))
      ).toBe(true);

      console.warn = originalWarn;
    });
  });

  describe('positional turn commands', () => {
    it('should turn left with angle', () => {
      const command = turtleLeft(Math.PI / 2);
      command.execute(state);
      const forward = state.getForward();
      expect(forward.x).toBeCloseTo(-1, 10);
      expect(forward.y).toBeCloseTo(0, 10);
    });

    it('should turn right with angle', () => {
      const command = turtleRight(Math.PI / 2);
      command.execute(state);
      const forward = state.getForward();
      expect(forward.x).toBeCloseTo(1, 10);
      expect(forward.y).toBeCloseTo(0, 10);
    });

    it('should turn left with degrees', () => {
      const command = turtleLeft(90, { units: 'degrees' });
      command.execute(state);
      const forward = state.getForward();
      expect(forward.x).toBeCloseTo(-1, 10);
      expect(forward.y).toBeCloseTo(0, 10);
    });

    it('should turn right with degrees', () => {
      const command = turtleRight(90, { units: 'degrees' });
      command.execute(state);
      const forward = state.getForward();
      expect(forward.x).toBeCloseTo(1, 10);
      expect(forward.y).toBeCloseTo(0, 10);
    });
  });

  describe('angle units command', () => {
    it('should create angle units command', () => {
      const command = turtleAngleUnits('degrees');
      expect(command.getUnits()).toBe('degrees');
    });
  });

  describe('command cloning', () => {
    it('should clone move commands', () => {
      const original = turtleMove({ forward: 10 });
      const cloned = original.clone();

      expect(cloned).not.toBe(original);
      expect(cloned.getOptions()).toEqual(original.getOptions());
    });

    it('should clone turn commands', () => {
      const original = turtleTurn({ left: 45, units: 'degrees' });
      const cloned = original.clone();

      expect(cloned).not.toBe(original);
      expect(cloned.getOptions()).toEqual(original.getOptions());
    });

    it('should clone left/right commands', () => {
      const originalLeft = turtleLeft(45, { units: 'degrees' });
      const clonedLeft = originalLeft.clone();

      expect(clonedLeft).not.toBe(originalLeft);
      expect(clonedLeft.getAngle()).toBe(originalLeft.getAngle());
      expect(clonedLeft.getOptions()).toEqual(originalLeft.getOptions());
    });
  });
});
