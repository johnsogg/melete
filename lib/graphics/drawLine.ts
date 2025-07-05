import { Pt } from '../geom';
import { DrawingStyle } from './types';
import { applyStyleAndDraw } from './utils';

// Draw line path only
export const drawLinePath = ({
  ctx,
  start,
  end,
  beginPath,
}: {
  ctx: CanvasRenderingContext2D;
  start: Pt;
  end: Pt;
  beginPath: boolean;
}): void => {
  if (beginPath) {
    ctx.beginPath();
  }
  ctx.moveTo(start.x, start.y);
  ctx.lineTo(end.x, end.y);
};

// Draw line with semantic parameters and styling
export const drawLineStyled = ({
  ctx,
  start,
  end,
  style,
}: {
  ctx: CanvasRenderingContext2D;
  start: Pt;
  end: Pt;
  style: DrawingStyle;
}): void => {
  applyStyleAndDraw(ctx, style, () => {
    drawLinePath({ ctx, start, end, beginPath: true });
  });
};
