import { Pt } from '../geom';
import { DrawingStyle } from './types';
import { applyStyleAndDraw } from './utils';

/**
 * Draw circle path only
 */
export const drawCirclePath = ({
  ctx,
  center,
  radius,
  beginPath,
}: {
  ctx: CanvasRenderingContext2D;
  center: Pt;
  radius: number;
  beginPath: boolean;
}): void => {
  if (beginPath) {
    ctx.beginPath();
  }
  ctx.arc(center.x, center.y, radius, 0, 2 * Math.PI);
};

/**
 * Draw circle with semantic parameters and styling
 */
export const drawCircleStyled = ({
  ctx,
  center,
  radius,
  style,
}: {
  ctx: CanvasRenderingContext2D;
  center: Pt;
  radius: number;
  style: DrawingStyle;
}): void => {
  applyStyleAndDraw(ctx, style, () => {
    drawCirclePath({ ctx, center, radius, beginPath: true });
  });
};
