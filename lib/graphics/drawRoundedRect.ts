import { AABB, getAABBSize } from '../geom';
import { DrawingStyle } from './types';
import { applyStyleAndDraw } from './utils';

/**
 * Draw rounded rectangle path only
 */
export const drawRoundedRectPath = ({
  ctx,
  bounds,
  radius,
  beginPath,
}: {
  ctx: CanvasRenderingContext2D;
  bounds: AABB;
  radius: number;
  beginPath: boolean;
}) => {
  const { minX, minY } = bounds;
  const { width, height } = getAABBSize(bounds);

  if (beginPath) {
    ctx.beginPath();
  }
  ctx.moveTo(minX + radius, minY);
  ctx.lineTo(minX + width - radius, minY);
  ctx.quadraticCurveTo(minX + width, minY, minX + width, minY + radius);
  ctx.lineTo(minX + width, minY + height - radius);
  ctx.quadraticCurveTo(
    minX + width,
    minY + height,
    minX + width - radius,
    minY + height
  );
  ctx.lineTo(minX + radius, minY + height);
  ctx.quadraticCurveTo(minX, minY + height, minX, minY + height - radius);
  ctx.lineTo(minX, minY + radius);
  ctx.quadraticCurveTo(minX, minY, minX + radius, minY);
  ctx.closePath();
};

/**
 * Draw rounded rectangle with styling
 */
export const drawRoundedRectStyled = ({
  ctx,
  bounds,
  radius,
  style,
}: {
  ctx: CanvasRenderingContext2D;
  bounds: AABB;
  radius: number;
  style: DrawingStyle;
}): void => {
  applyStyleAndDraw(ctx, style, () => {
    drawRoundedRectPath({ ctx, bounds, radius, beginPath: true });
  });
};
