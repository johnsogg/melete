export type { Color, Font, DrawingStyle, AnimationState } from './types';

export { drawRoundedRectPath, drawRoundedRectStyled } from './drawRoundedRect';
export { drawCurvedEdgePath, drawCurvedEdgeStyled } from './drawCurvedEdge';
export { drawArrowheadPath, drawArrowheadStyled } from './drawArrowhead';
export { drawRectPath, drawRectStyled } from './drawRect';
export { drawCirclePath, drawCircleStyled } from './drawCircle';
export { drawLinePath, drawLineStyled } from './drawLine';
export { drawPolygonPath, drawPolygonStyled } from './drawPolygon';
export { drawTrianglePath, drawTriangleStyled } from './drawTriangle';
export { drawTextStyled } from './drawText';
export {
  measureText,
  getTextBounds,
  getTextDimensions,
  centerTextInRect,
  alignTextInBox,
} from './textUtils';

// Easing functions
export const easingFunctions = {
  linear: (t: number) => t,
  'ease-in': (t: number) => t * t,
  'ease-out': (t: number) => 1 - (1 - t) * (1 - t),
  'ease-in-out': (t: number) =>
    t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2,
};

// Clear canvas with optional background color
export const clearCanvas = ({
  ctx,
  color,
}: {
  ctx: CanvasRenderingContext2D;
  color?: string;
}): void => {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  if (color) {
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  }
};
