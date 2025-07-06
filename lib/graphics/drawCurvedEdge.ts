import { BezierQuad } from '../geom';
import { DrawingStyle } from './types';
import { applyStyleAndDraw } from './utils';

/**
 * Draw curved edge path only using quadratic Bezier curve
 */
export const drawCurvedEdgePath = ({
  ctx,
  bezier,
  beginPath,
}: {
  ctx: CanvasRenderingContext2D;
  bezier: BezierQuad;
  beginPath: boolean;
}) => {
  if (beginPath) {
    ctx.beginPath();
  }
  ctx.moveTo(bezier.start.x, bezier.start.y);
  ctx.quadraticCurveTo(
    bezier.control.x,
    bezier.control.y,
    bezier.end.x,
    bezier.end.y
  );
};

/**
 * Draw curved edge with styling using quadratic Bezier curve
 */
export const drawCurvedEdgeStyled = ({
  ctx,
  bezier,
  style,
}: {
  ctx: CanvasRenderingContext2D;
  bezier: BezierQuad;
  style: DrawingStyle;
}): void => {
  applyStyleAndDraw(ctx, style, () => {
    drawCurvedEdgePath({ ctx, bezier, beginPath: true });
  });
};
