import { Pt } from '../geom';
import { DrawingStyle } from './types';
import { applyStyleAndDraw } from './utils';

/**
 * Draw polygon path only
 */
export const drawPolygonPath = ({
  ctx,
  points,
  beginPath,
}: {
  ctx: CanvasRenderingContext2D;
  points: Pt[];
  beginPath: boolean;
}): void => {
  if (points.length < 3) return;

  if (beginPath) {
    ctx.beginPath();
  }
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i].x, points[i].y);
  }
  ctx.closePath();
};

/**
 * Draw polygon and styling
 */
export const drawPolygonStyled = ({
  ctx,
  points,
  style,
}: {
  ctx: CanvasRenderingContext2D;
  points: Pt[];
  style: DrawingStyle;
}): void => {
  if (points.length < 3) return;

  applyStyleAndDraw(ctx, style, () => {
    drawPolygonPath({ ctx, points, beginPath: true });
  });
};
