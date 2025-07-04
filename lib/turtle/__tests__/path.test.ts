/**
 * Unit tests for turtle path generation
 */

import { 
  TurtlePathGenerator, 
  generateTurtlePath, 
  renderTurtlePath,
  renderTurtlePathSegmented 
} from '../path';
import { 
  turtleMove, 
  turtleLeft, 
  turtlePenUp, 
  turtlePenDown 
} from '../commands';
import { TurtleState } from '../state';

describe('TurtlePathGenerator', () => {
  let generator: TurtlePathGenerator;

  beforeEach(() => {
    generator = new TurtlePathGenerator();
  });

  describe('basic path generation', () => {
    it('should generate empty path for no commands', () => {
      const path = generator.generatePath([]);
      
      expect(path.segments).toHaveLength(0);
      expect(path.bounds).toEqual({ minX: 0, maxX: 0, minY: 0, maxY: 0 });
    });

    it('should generate path for simple forward movement', () => {
      const commands = [turtleMove({ forward: 10 })];
      const path = generator.generatePath(commands);
      
      expect(path.segments).toHaveLength(1);
      expect(path.segments[0]).toEqual({
        from: { x: 0, y: 0 },
        to: { x: 0, y: 10 },
        penDown: true
      });
    });

    it('should track pen state correctly', () => {
      const commands = [
        turtlePenUp(),
        turtleMove({ forward: 5 }),
        turtlePenDown(),
        turtleMove({ forward: 5 })
      ];
      const path = generator.generatePath(commands);
      
      expect(path.segments).toHaveLength(2);
      expect(path.segments[0].penDown).toBe(false);
      expect(path.segments[1].penDown).toBe(true);
    });

    it('should calculate bounds correctly', () => {
      const commands = [
        turtleMove({ forward: 10 }),
        turtleLeft(Math.PI / 2),
        turtleMove({ forward: 5 }),
        turtleLeft(Math.PI / 2),
        turtleMove({ forward: 10 }),
        turtleLeft(Math.PI / 2),
        turtleMove({ forward: 5 })
      ];
      const path = generator.generatePath(commands);
      
      expect(path.bounds.minX).toBeCloseTo(-5, 10);
      expect(path.bounds.maxX).toBeCloseTo(0, 10);
      expect(path.bounds.minY).toBeCloseTo(0, 10);
      expect(path.bounds.maxY).toBeCloseTo(10, 10);
    });
  });

  describe('complex path generation', () => {
    it('should handle turtle square', () => {
      const commands = [
        turtleMove({ forward: 10 }),
        turtleLeft(Math.PI / 2),
        turtleMove({ forward: 10 }),
        turtleLeft(Math.PI / 2),
        turtleMove({ forward: 10 }),
        turtleLeft(Math.PI / 2),
        turtleMove({ forward: 10 })
      ];
      const path = generator.generatePath(commands);
      
      expect(path.segments).toHaveLength(4);
      
      // Check first segment (forward)
      expect(path.segments[0].from).toEqual({ x: 0, y: 0 });
      expect(path.segments[0].to.x).toBeCloseTo(0, 10);
      expect(path.segments[0].to.y).toBeCloseTo(10, 10);
      
      // Check second segment (left)
      expect(path.segments[1].to.x).toBeCloseTo(-10, 10);
      expect(path.segments[1].to.y).toBeCloseTo(10, 10);
    });

    it('should ignore non-movement commands in path', () => {
      const commands = [
        turtleLeft(Math.PI / 4),  // Turn only - no movement
        turtleMove({ forward: 10 }),
        turtlePenUp(),  // Pen state change only
        turtlePenDown(),  // Pen state change only
        turtleMove({ forward: 5 })
      ];
      const path = generator.generatePath(commands);
      
      expect(path.segments).toHaveLength(2);
    });

    it('should handle movements with pen up and down', () => {
      const commands = [
        turtleMove({ forward: 5 }),  // pen down
        turtlePenUp(),
        turtleMove({ forward: 5 }),  // pen up
        turtlePenDown(),
        turtleMove({ forward: 5 })   // pen down
      ];
      const path = generator.generatePath(commands);
      
      expect(path.segments).toHaveLength(3);
      expect(path.segments[0].penDown).toBe(true);
      expect(path.segments[1].penDown).toBe(false);
      expect(path.segments[2].penDown).toBe(true);
    });
  });

  describe('state management', () => {
    it('should use initial state if provided', () => {
      const initialState = new TurtleState({ x: 10, y: 20, z: 0 });
      const generator = new TurtlePathGenerator(initialState);
      
      const commands = [turtleMove({ forward: 5 })];
      const path = generator.generatePath(commands);
      
      expect(path.segments[0].from).toEqual({ x: 10, y: 20 });
      expect(path.segments[0].to.x).toBeCloseTo(10, 10);
      expect(path.segments[0].to.y).toBeCloseTo(25, 10);
    });

    it('should reset generator state', () => {
      const commands = [turtleMove({ forward: 10 })];
      generator.generatePath(commands);
      
      const newInitialState = new TurtleState({ x: 100, y: 200, z: 0 });
      generator.reset(newInitialState);
      
      const newPath = generator.generatePath([turtleMove({ forward: 5 })]);
      expect(newPath.segments[0].from).toEqual({ x: 100, y: 200 });
    });
  });
});

describe('generateTurtlePath convenience function', () => {
  it('should generate path without explicit generator', () => {
    const commands = [
      turtleMove({ forward: 10 }),
      turtleLeft(Math.PI / 2),
      turtleMove({ forward: 5 })
    ];
    
    const path = generateTurtlePath(commands);
    expect(path.segments).toHaveLength(2);
  });

  it('should use provided initial state', () => {
    const initialState = new TurtleState({ x: 5, y: 5, z: 0 });
    const commands = [turtleMove({ forward: 10 })];
    
    const path = generateTurtlePath(commands, initialState);
    expect(path.segments[0].from).toEqual({ x: 5, y: 5 });
  });
});

describe('path rendering functions', () => {
  let ctx: CanvasRenderingContext2D;

  beforeEach(() => {
    // Mock CanvasRenderingContext2D for testing
    ctx = {
      save: () => {},
      restore: () => {},
      beginPath: () => {},
      moveTo: () => {},
      lineTo: () => {},
      stroke: () => {},
      strokeStyle: '#000000',
      lineWidth: 1,
      lineCap: 'butt',
      lineJoin: 'miter'
    } as any;
  });

  describe('renderTurtlePath', () => {
    it('should handle empty path without error', () => {
      const emptyPath = { segments: [], bounds: { minX: 0, maxX: 0, minY: 0, maxY: 0 } };
      expect(() => renderTurtlePath(ctx, emptyPath)).not.toThrow();
    });

    it('should apply style options', () => {
      const path = generateTurtlePath([turtleMove({ forward: 10 })]);
      const style = {
        strokeStyle: '#ff0000',
        lineWidth: 3,
        lineCap: 'round' as CanvasLineCap
      };
      
      expect(() => renderTurtlePath(ctx, path, style)).not.toThrow();
      expect(ctx.strokeStyle).toBe('#ff0000');
      expect(ctx.lineWidth).toBe(3);
      expect(ctx.lineCap).toBe('round');
    });

    it('should only draw pen-down segments', () => {
      const commands = [
        turtleMove({ forward: 5 }),
        turtlePenUp(),
        turtleMove({ forward: 5 }),
        turtlePenDown(),
        turtleMove({ forward: 5 })
      ];
      const path = generateTurtlePath(commands);
      
      expect(() => renderTurtlePath(ctx, path)).not.toThrow();
      // We can't easily test the actual drawing, but we can verify no errors
    });
  });

  describe('renderTurtlePathSegmented', () => {
    it('should handle empty path without error', () => {
      const emptyPath = { segments: [], bounds: { minX: 0, maxX: 0, minY: 0, maxY: 0 } };
      expect(() => renderTurtlePathSegmented(ctx, emptyPath)).not.toThrow();
    });

    it('should apply different styles for pen up/down', () => {
      const commands = [
        turtleMove({ forward: 5 }),
        turtlePenUp(),
        turtleMove({ forward: 5 })
      ];
      const path = generateTurtlePath(commands);
      
      const style = {
        penDownStyle: '#000000',
        penUpStyle: '#cccccc',
        lineWidth: 2
      };
      
      expect(() => renderTurtlePathSegmented(ctx, path, style)).not.toThrow();
    });
  });
});