import { Pt } from '../geom';
import { DrawingStyle } from './types';
import { applyCanvasStyle } from './utils';

/**
 * Draw text bounding box path only (for API consistency)
 * Creates a rectangular path representing the text bounds
 */
export const drawTextPathBounds = ({
  ctx,
  text,
  position,
  beginPath,
}: {
  ctx: CanvasRenderingContext2D;
  text: string;
  position: Pt;
  beginPath: boolean;
}): void => {
  if (beginPath) {
    ctx.beginPath();
  }

  // Measure text to get bounds
  const metrics = ctx.measureText(text);
  const width = metrics.width;
  const height =
    metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent || 12;

  // Create rectangular path representing text bounds
  ctx.rect(
    position.x,
    position.y - metrics.actualBoundingBoxAscent,
    width,
    height
  );
};

/**
 * Draw text with and styling
 */
export const drawTextStyled = ({
  ctx,
  text,
  position,
  style,
}: {
  ctx: CanvasRenderingContext2D;
  text: string;
  position: Pt;
  style: DrawingStyle;
}): void => {
  // Text rendering is special - it doesn't use the standard fill/stroke pattern
  // So we use applyCanvasStyle directly instead of applyStyleAndDraw
  applyCanvasStyle(ctx, style);
  ctx.fillText(text, position.x, position.y);
};
