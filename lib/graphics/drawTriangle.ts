import { Pt } from '../geom';
import { DrawingStyle } from './types';
import { drawPolygonPath } from './drawPolygon';
import { applyStyleAndDraw } from './utils';

/**
 * Draw triangle path only
 */
export const drawTrianglePath = ({
  ctx,
  p1,
  p2,
  p3,
  beginPath,
}: {
  ctx: CanvasRenderingContext2D;
  p1: Pt;
  p2: Pt;
  p3: Pt;
  beginPath: boolean;
}): void => {
  drawPolygonPath({ ctx, points: [p1, p2, p3], beginPath });
};

/**
 * Draw triangle and styling
 */
export const drawTriangleStyled = ({
  ctx,
  p1,
  p2,
  p3,
  style,
}: {
  ctx: CanvasRenderingContext2D;
  p1: Pt;
  p2: Pt;
  p3: Pt;
  style: DrawingStyle;
}): void => {
  applyStyleAndDraw(ctx, style, () => {
    drawPolygonPath({ ctx, points: [p1, p2, p3], beginPath: true });
  });
};
