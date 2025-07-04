/**
 * Unit tests for hierarchical turtle operations (push/pop)
 */

import { 
  TurtleEngine,
  turtleMove,
  turtleLeft,
  turtleRight,
  turtlePush,
  turtlePop,
  turtleAngleUnits
} from '../index';
import { TurtleState } from '../state';

describe('Hierarchical Turtle Operations', () => {
  let engine: TurtleEngine;

  beforeEach(() => {
    engine = new TurtleEngine();
  });

  describe('push and pop commands', () => {
    it('should save and restore turtle state', () => {
      const initialState = new TurtleState({ x: 100, y: 100, z: 0 });
      engine = new TurtleEngine(initialState);

      const commands = [
        turtlePush(),
        turtleMove({ forward: 50 }),
        turtleLeft(Math.PI / 2),
        turtleMove({ forward: 30 }),
        turtlePop()
      ];

      const finalState = engine.execute(commands);

      // After pop, should be back to initial state
      expect(finalState.getPosition().x).toBeCloseTo(100, 10);
      expect(finalState.getPosition().y).toBeCloseTo(100, 10);
      expect(finalState.getForward().equals(initialState.getForward())).toBe(true);
    });

    it('should handle nested push/pop operations', () => {
      const commands = [
        turtleMove({ forward: 10 }),    // Move to (0, 10)
        turtlePush(),                   // Save state at (0, 10)
        turtleMove({ forward: 20 }),    // Move to (0, 30)
        turtlePush(),                   // Save state at (0, 30)
        turtleMove({ forward: 15 }),    // Move to (0, 45)
        turtlePop(),                    // Back to (0, 30)
        turtleMove({ left: 5 }),        // Move to (-5, 30)
        turtlePop()                     // Back to (0, 10)
      ];

      const finalState = engine.execute(commands);
      const pos = finalState.getPosition();

      expect(pos.x).toBeCloseTo(0, 10);
      expect(pos.y).toBeCloseTo(10, 10);
    });

    it('should preserve orientation when popping', () => {
      const commands = [
        turtlePush(),
        turtleLeft(Math.PI / 4),       // Turn 45 degrees
        turtleMove({ forward: 50 }),
        turtlePop()
      ];

      const finalState = engine.execute(commands);

      // Should be back at origin and facing original direction
      expect(finalState.getPosition().x).toBeCloseTo(0, 10);
      expect(finalState.getPosition().y).toBeCloseTo(0, 10);
      expect(finalState.getForward().y).toBeCloseTo(1, 10); // Facing up
      expect(finalState.getForward().x).toBeCloseTo(0, 10);
    });

    it('should handle pop from empty stack gracefully', () => {
      const originalWarn = console.warn;
      const warnings: string[] = [];
      console.warn = (message: string) => warnings.push(message);

      const commands = [
        turtleMove({ forward: 10 }),
        turtlePop() // Pop from empty stack
      ];

      const finalState = engine.execute(commands);

      expect(warnings.some(w => w.includes('empty stack'))).toBe(true);
      expect(finalState.getPosition().y).toBeCloseTo(10, 10);

      console.warn = originalWarn;
    });
  });

  describe('branching patterns', () => {
    it('should create tree-like branching structure', () => {
      const commands = [
        turtleAngleUnits('degrees'),
        turtleMove({ forward: 30 }),     // Trunk

        // Left branch
        turtlePush(),
        turtleLeft(45),
        turtleMove({ forward: 20 }),
        turtlePop(),

        // Right branch  
        turtlePush(),
        turtleRight(45),
        turtleMove({ forward: 20 }),
        turtlePop()
      ];

      const finalState = engine.execute(commands);

      // Should end back at the top of the trunk
      expect(finalState.getPosition().x).toBeCloseTo(0, 10);
      expect(finalState.getPosition().y).toBeCloseTo(30, 10);
      expect(finalState.getForward().y).toBeCloseTo(1, 10); // Still facing up
    });

    it('should create complex nested branching', () => {
      const commands = [
        turtleMove({ forward: 20 }),     // Main stem

        // First branch system
        turtlePush(),
        turtleLeft(Math.PI / 4),
        turtleMove({ forward: 15 }),

        // Sub-branch
        turtlePush(),
        turtleLeft(Math.PI / 6),
        turtleMove({ forward: 10 }),
        turtlePop(), // Back to main branch
        
        turtlePop(), // Back to main stem

        // Second branch system
        turtlePush(),
        turtleRight(Math.PI / 3),
        turtleMove({ forward: 12 }),
        turtlePop()  // Back to main stem
      ];

      const finalState = engine.execute(commands);

      // Should be back at the top of the main stem
      expect(finalState.getPosition().x).toBeCloseTo(0, 10);
      expect(finalState.getPosition().y).toBeCloseTo(20, 10);
      expect(finalState.getForward().y).toBeCloseTo(1, 10);
    });
  });

  describe('state consistency', () => {
    it('should maintain pen state across push/pop', () => {
      const commands = [
        turtlePush(),
        // (pen should start down)
        turtleMove({ forward: 10 }),
        turtlePop()
      ];

      const finalState = engine.execute(commands);
      expect(finalState.isPenDown()).toBe(true);
    });

    it('should handle angle units context with push/pop', () => {
      const commands = [
        turtleAngleUnits('degrees'),
        turtlePush(),
        turtleLeft(90),                  // Should be in degrees
        turtleMove({ forward: 10 }),
        turtlePop(),
        turtleLeft(90),                  // Still in degrees context
        turtleMove({ forward: 10 })
      ];

      const finalState = engine.execute(commands);
      
      // After two 90-degree left turns and moves, should be at (-10, 0)
      expect(finalState.getPosition().x).toBeCloseTo(-10, 10);
      expect(finalState.getPosition().y).toBeCloseTo(0, 10);
    });
  });
});