/**
 * Path generation from turtle commands for Canvas rendering
 */

import { TurtleState } from './state';
import { TurtleCommand } from './commands';
import { TurtleEngine } from './engine';
import { Pt, AABB } from '../geom/types';

export interface TurtlePathSegment {
  from: Pt;
  to: Pt;
  penDown: boolean;
}

export interface TurtlePath {
  segments: TurtlePathSegment[];
  bounds: AABB;
}

export class TurtlePathGenerator {
  private engine: TurtleEngine;
  private segments: TurtlePathSegment[] = [];

  constructor(initialState?: TurtleState) {
    this.engine = new TurtleEngine(initialState);
  }

  generatePath(commands: TurtleCommand[]): TurtlePath {
    this.segments = [];
    let currentState = this.engine.getState();

    for (const command of commands) {
      const previousPosition = currentState.getPosition();
      const wasPenDown = currentState.isPenDown();

      // Execute the command
      this.engine.execute([command]);
      currentState = this.engine.getState();

      const newPosition = currentState.getPosition();

      // Check if the turtle moved
      if (this.hasPositionChanged(previousPosition, newPosition)) {
        this.segments.push({
          from: { x: previousPosition.x, y: previousPosition.y },
          to: { x: newPosition.x, y: newPosition.y },
          penDown: wasPenDown,
        });
      }
    }

    return this.createTurtlePath();
  }

  private hasPositionChanged(
    pos1: { x: number; y: number; z: number },
    pos2: { x: number; y: number; z: number }
  ): boolean {
    const epsilon = 1e-10;
    return (
      Math.abs(pos1.x - pos2.x) > epsilon ||
      Math.abs(pos1.y - pos2.y) > epsilon ||
      Math.abs(pos1.z - pos2.z) > epsilon
    );
  }

  private createTurtlePath(): TurtlePath {
    if (this.segments.length === 0) {
      return {
        segments: [],
        bounds: { minX: 0, maxX: 0, minY: 0, maxY: 0 },
      };
    }

    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;

    for (const segment of this.segments) {
      minX = Math.min(minX, segment.from.x, segment.to.x);
      maxX = Math.max(maxX, segment.from.x, segment.to.x);
      minY = Math.min(minY, segment.from.y, segment.to.y);
      maxY = Math.max(maxY, segment.from.y, segment.to.y);
    }

    return {
      segments: this.segments,
      bounds: { minX, maxX, minY, maxY },
    };
  }

  reset(initialState?: TurtleState): void {
    this.engine.reset(initialState);
    this.segments = [];
  }
}

// Convenience function for generating paths
export function generateTurtlePath(
  commands: TurtleCommand[],
  initialState?: TurtleState
): TurtlePath {
  const generator = new TurtlePathGenerator(initialState);
  return generator.generatePath(commands);
}

// Function to render a turtle path to Canvas
export function renderTurtlePath(
  ctx: CanvasRenderingContext2D,
  path: TurtlePath,
  style?: {
    strokeStyle?: string;
    lineWidth?: number;
    lineCap?: CanvasLineCap;
    lineJoin?: CanvasLineJoin;
  }
): void {
  if (path.segments.length === 0) return;

  ctx.save();

  // Apply style if provided
  if (style) {
    if (style.strokeStyle) ctx.strokeStyle = style.strokeStyle;
    if (style.lineWidth) ctx.lineWidth = style.lineWidth;
    if (style.lineCap) ctx.lineCap = style.lineCap;
    if (style.lineJoin) ctx.lineJoin = style.lineJoin;
  }

  // Group consecutive pen-down segments for efficient drawing
  let currentPath: TurtlePathSegment[] = [];

  for (const segment of path.segments) {
    if (segment.penDown) {
      currentPath.push(segment);
    } else {
      // Draw accumulated path if any
      if (currentPath.length > 0) {
        drawPathSegments(ctx, currentPath);
        currentPath = [];
      }
    }
  }

  // Draw remaining path segments
  if (currentPath.length > 0) {
    drawPathSegments(ctx, currentPath);
  }

  ctx.restore();
}

function drawPathSegments(
  ctx: CanvasRenderingContext2D,
  segments: TurtlePathSegment[]
): void {
  if (segments.length === 0) return;

  ctx.beginPath();

  // Start from the first segment
  ctx.moveTo(segments[0].from.x, segments[0].from.y);

  for (const segment of segments) {
    ctx.lineTo(segment.to.x, segment.to.y);
  }

  ctx.stroke();
}

// Alternative function that draws each segment separately (useful for debugging)
export function renderTurtlePathSegmented(
  ctx: CanvasRenderingContext2D,
  path: TurtlePath,
  style?: {
    strokeStyle?: string;
    lineWidth?: number;
    penUpStyle?: string;
    penDownStyle?: string;
  }
): void {
  if (path.segments.length === 0) return;

  ctx.save();

  const defaultPenDownStyle =
    style?.strokeStyle || style?.penDownStyle || '#000000';
  const defaultPenUpStyle = style?.penUpStyle || '#cccccc';
  const lineWidth = style?.lineWidth || 1;

  ctx.lineWidth = lineWidth;

  for (const segment of path.segments) {
    ctx.strokeStyle = segment.penDown ? defaultPenDownStyle : defaultPenUpStyle;

    ctx.beginPath();
    ctx.moveTo(segment.from.x, segment.from.y);
    ctx.lineTo(segment.to.x, segment.to.y);
    ctx.stroke();
  }

  ctx.restore();
}
