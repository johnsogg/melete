import { DrawingStyle } from './types';

// Apply drawing styles to canvas context
export const applyCanvasStyle = (
  ctx: CanvasRenderingContext2D,
  style: DrawingStyle
): void => {
  if (style.color) {
    ctx.fillStyle = style.color;
  }
  if (style.strokeColor) {
    ctx.strokeStyle = style.strokeColor;
  }
  if (style.strokeThickness !== undefined) {
    ctx.lineWidth = style.strokeThickness;
  }
  if (style.font) {
    ctx.font = style.font;
  }
  if (style.textColor) {
    ctx.fillStyle = style.textColor;
  }
};

// Apply styling and perform fill/stroke operations
export const applyStyleAndDraw = (
  ctx: CanvasRenderingContext2D,
  style: DrawingStyle,
  drawPath: () => void
): void => {
  drawPath();

  if (style.fill) {
    applyCanvasStyle(ctx, style);
    ctx.fill();
  }

  if (style.stroke) {
    applyCanvasStyle(ctx, style);
    ctx.stroke();
  }
};
