import { Pt } from '../geom';
import { DrawingStyle } from './types';
import { applyCanvasStyle } from './utils';

// Draw text with semantic parameters and styling
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
  applyCanvasStyle(ctx, style);
  ctx.fillText(text, position.x, position.y);
};
