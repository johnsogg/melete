/**
 * Integration tests for turtle graphics with Melete layers
 */

import { DrawingLayer } from '../../layer';
import { Canvas } from '../../canvas';
import {
  turtleMove,
  turtleLeft,
  turtleAngleUnits,
  TurtleState,
} from '../index';

describe('Turtle Graphics Integration', () => {
  let canvas: Canvas;
  let layer: DrawingLayer;

  beforeEach(() => {
    // Mock canvas for testing
    const mockElement = {
      width: 400,
      height: 300,
      getContext: () => ({
        canvas: { width: 400, height: 300 },
        save: () => {},
        restore: () => {},
        beginPath: () => {},
        moveTo: () => {},
        lineTo: () => {},
        stroke: () => {},
        strokeStyle: '#000000',
        lineWidth: 1,
        lineCap: 'butt',
        lineJoin: 'miter',
      }),
    } as any;

    canvas = new Canvas(mockElement, { width: 400, height: 300 });

    layer = new DrawingLayer(
      'test',
      { cache: false, offscreen: false },
      canvas,
      {}
    );
  });

  describe('layer.turtle() method', () => {
    it('should execute turtle commands and draw to canvas', () => {
      const commands = [
        turtleMove({ forward: 50 }),
        turtleLeft(Math.PI / 2),
        turtleMove({ forward: 30 }),
      ];

      const initialState = new TurtleState({ x: 100, y: 100, z: 0 });

      expect(() => {
        layer.turtle(commands, { initialState });
      }).not.toThrow();
    });

    it('should apply custom styling options', () => {
      const commands = [turtleMove({ forward: 50 })];

      const options = {
        strokeStyle: '#ff0000',
        lineWidth: 3,
        lineCap: 'round' as CanvasLineCap,
      };

      expect(() => {
        layer.turtle(commands, options);
      }).not.toThrow();
    });

    it('should return final turtle state', () => {
      const commands = [
        turtleMove({ forward: 50 }),
        turtleLeft(Math.PI / 2),
        turtleMove({ forward: 30 }),
      ];

      const initialState = new TurtleState({ x: 0, y: 0, z: 0 });
      const finalState = layer.turtle(commands, { initialState });

      // The final state should reflect the turtle's position after the commands
      expect(finalState).toBeInstanceOf(TurtleState);
      expect(finalState.getPosition().x).toBeCloseTo(-30, 5);
      expect(finalState.getPosition().y).toBeCloseTo(50, 5);
    });

    it('should handle empty command list', () => {
      const finalState = layer.turtle([]);
      expect(finalState).toBeInstanceOf(TurtleState);
      expect(finalState.getPosition()).toEqual({ x: 0, y: 0, z: 0 });
    });

    it('should work with degree-based commands', () => {
      const commands = [
        turtleAngleUnits('degrees'),
        turtleMove({ forward: 50 }),
        turtleLeft(90),
        turtleMove({ forward: 30 }),
      ];

      expect(() => {
        layer.turtle(commands);
      }).not.toThrow();
    });
  });

  describe('turtle graphics patterns', () => {
    it('should draw square pattern', () => {
      const commands = [
        turtleAngleUnits('degrees'),
        turtleMove({ forward: 50 }),
        turtleLeft(90),
        turtleMove({ forward: 50 }),
        turtleLeft(90),
        turtleMove({ forward: 50 }),
        turtleLeft(90),
        turtleMove({ forward: 50 }),
      ];

      const initialState = new TurtleState({ x: 100, y: 100, z: 0 });
      const finalState = layer.turtle(commands, { initialState });

      // After drawing a square, turtle should be back at starting position
      // Start (100,100) → +Y 50 → (100,150) → L90° → -X 50 → (50,150) → L90° → -Y 50 → (50,100) → L90° → +X 50 → (100,100)
      const pos = finalState.getPosition();
      expect(pos.x).toBeCloseTo(100, 5);
      expect(pos.y).toBeCloseTo(100, 5);
    });

    it('should draw triangle pattern', () => {
      const commands = [
        turtleAngleUnits('degrees'),
        turtleMove({ forward: 60 }),
        turtleLeft(120),
        turtleMove({ forward: 60 }),
        turtleLeft(120),
        turtleMove({ forward: 60 }),
      ];

      const initialState = new TurtleState({ x: 50, y: 50, z: 0 });
      const finalState = layer.turtle(commands, { initialState });

      // After drawing a triangle, turtle should be back at starting position
      // Start (50,50) → +Y 60 → (50,110) → L120° → 120° left from +Y → then 60 forward → back to start
      const pos = finalState.getPosition();
      expect(pos.x).toBeCloseTo(50, 5);
      expect(pos.y).toBeCloseTo(50, 5);
    });
  });
});
