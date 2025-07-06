import { Pt } from '../geom';
import { DrawingStyle } from './types';
import { applyStyleAndDraw } from './utils';

/**
 * Draw rectangle path only
 */
export const drawRectPath = ({
  ctx,
  topLeft,
  width,
  height,
  beginPath,
}: {
  ctx: CanvasRenderingContext2D;
  topLeft: Pt;
  width: number;
  height: number;
  beginPath: boolean;
}): void => {
  if (beginPath) {
    ctx.beginPath();
  }
  ctx.rect(topLeft.x, topLeft.y, width, height);
};

/**
 * Draw rectangle with styling
 */
export const drawRectStyled = ({
  ctx,
  topLeft,
  width,
  height,
  style,
}: {
  ctx: CanvasRenderingContext2D;
  topLeft: Pt;
  width: number;
  height: number;
  style: DrawingStyle;
}): void => {
  applyStyleAndDraw(ctx, style, () => {
    drawRectPath({ ctx, topLeft, width, height, beginPath: true });
  });
};
