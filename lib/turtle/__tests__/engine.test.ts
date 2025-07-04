/**
 * Unit tests for turtle execution engine
 */

import { TurtleEngine, executeTurtleSequence } from '../engine';
import { 
  turtleAngleUnits,
  turtlePenUp,
  turtlePenDown,
  turtleMove,
  turtleTurn,
  turtleLeft,
  turtleRight
} from '../commands';
import { TurtleState } from '../state';

describe('TurtleEngine', () => {
  let engine: TurtleEngine;

  beforeEach(() => {
    engine = new TurtleEngine();
  });

  describe('basic command execution', () => {
    it('should execute single command', () => {
      const commands = [turtleMove({ forward: 10 })];
      const result = engine.execute(commands);
      
      const pos = result.getPosition();
      expect(pos.y).toBeCloseTo(10, 10);
    });

    it('should execute multiple commands in sequence', () => {
      const commands = [
        turtleMove({ forward: 10 }),
        turtleLeft(Math.PI / 2),
        turtleMove({ forward: 5 })
      ];
      const result = engine.execute(commands);
      
      const pos = result.getPosition();
      expect(pos.x).toBeCloseTo(-5, 10);
      expect(pos.y).toBeCloseTo(10, 10);
    });

    it('should handle pen state changes', () => {
      const commands = [
        turtlePenUp(),
        turtleMove({ forward: 10 }),
        turtlePenDown()
      ];
      const result = engine.execute(commands);
      
      expect(result.isPenDown()).toBe(true);
    });
  });

  describe('angle units handling', () => {
    it('should use default radians', () => {
      const commands = [
        turtleLeft(Math.PI / 2),
        turtleMove({ forward: 10 })
      ];
      const result = engine.execute(commands);
      
      const pos = result.getPosition();
      expect(pos.x).toBeCloseTo(-10, 10);
      expect(pos.y).toBeCloseTo(0, 10);
    });

    it('should change default units with turtleAngleUnits', () => {
      const commands = [
        turtleAngleUnits('degrees'),
        turtleLeft(90),
        turtleMove({ forward: 10 })
      ];
      const result = engine.execute(commands);
      
      const pos = result.getPosition();
      expect(pos.x).toBeCloseTo(-10, 10);
      expect(pos.y).toBeCloseTo(0, 10);
    });

    it('should handle mixed unit commands', () => {
      const commands = [
        turtleAngleUnits('degrees'),
        turtleLeft(90), // Should use degrees
        turtleTurn({ right: Math.PI / 2, units: 'radians' }), // Override to radians
        turtleMove({ forward: 10 })
      ];
      const result = engine.execute(commands);
      
      const pos = result.getPosition();
      expect(pos.y).toBeCloseTo(10, 10);
    });
  });

  describe('state management', () => {
    it('should preserve original state', () => {
      const initialState = new TurtleState({ x: 5, y: 5, z: 0 });
      const engine = new TurtleEngine(initialState);
      
      const commands = [turtleMove({ forward: 10 })];
      const result = engine.execute(commands);
      
      // Original state should be unchanged
      expect(initialState.getPosition()).toEqual({ x: 5, y: 5, z: 0 });
      
      // Result should be different
      const resultPos = result.getPosition();
      expect(resultPos.x).toBeCloseTo(5, 10);
      expect(resultPos.y).toBeCloseTo(15, 10);
    });

    it('should get current state', () => {
      const commands = [turtleMove({ forward: 10 })];
      engine.execute(commands);
      
      const state = engine.getState();
      expect(state.getPosition().y).toBeCloseTo(10, 10);
    });

    it('should get execution context', () => {
      const commands = [
        turtleAngleUnits('degrees'),
        turtleMove({ forward: 10 })
      ];
      engine.execute(commands);
      
      const context = engine.getContext();
      expect(context.defaultAngleUnits).toBe('degrees');
      expect(context.state.getPosition().y).toBeCloseTo(10, 10);
    });

    it('should reset engine state', () => {
      const commands = [turtleMove({ forward: 10 })];
      engine.execute(commands);
      
      const newInitialState = new TurtleState({ x: 100, y: 200, z: 0 });
      engine.reset(newInitialState);
      
      const state = engine.getState();
      expect(state.getPosition()).toEqual({ x: 100, y: 200, z: 0 });
    });
  });

  describe('complex sequences', () => {
    it('should execute the example from TURTLE_PLAN.md', () => {
      const commands = [
        turtleAngleUnits('radians'),
        turtlePenUp(),
        turtleTurn({ left: 45, units: 'degrees' }),
        turtleMove({ forward: 50 }),
        turtlePenDown(),
        turtleTurn({ pitch: Math.PI / 4 }),
        turtleRight(Math.PI / 2),
        turtleLeft(45, { units: 'degrees' })
      ];
      
      const result = engine.execute(commands);
      
      // Should not throw and should have moved/rotated
      expect(result.isPenDown()).toBe(true);
      
      const pos = result.getPosition();
      expect(pos.x).not.toBeCloseTo(0, 1);
      expect(pos.y).not.toBeCloseTo(0, 1);
    });
  });
});

describe('executeTurtleSequence convenience function', () => {
  it('should execute sequence without explicit engine', () => {
    const commands = [
      turtleMove({ forward: 10 }),
      turtleLeft(Math.PI / 2),
      turtleMove({ forward: 5 })
    ];
    
    const result = executeTurtleSequence(commands);
    const pos = result.getPosition();
    
    expect(pos.x).toBeCloseTo(-5, 10);
    expect(pos.y).toBeCloseTo(10, 10);
  });

  it('should use provided initial state', () => {
    const initialState = new TurtleState({ x: 10, y: 20, z: 0 });
    const commands = [turtleMove({ forward: 5 })];
    
    const result = executeTurtleSequence(commands, initialState);
    const pos = result.getPosition();
    
    expect(pos.x).toBeCloseTo(10, 10);
    expect(pos.y).toBeCloseTo(25, 10);
  });
});