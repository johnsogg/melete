import { AABB, Pt } from '../geom';

// Measure text with optional font setting
export const measureText = ({
  ctx,
  text,
  font,
}: {
  ctx: CanvasRenderingContext2D;
  text: string;
  font?: string;
}): TextMetrics => {
  const originalFont = ctx.font;
  if (font) {
    ctx.font = font;
  }
  const metrics = ctx.measureText(text);
  if (font) {
    ctx.font = originalFont;
  }
  return metrics;
};

// Get text bounds (width and height)
export const getTextBounds = ({
  ctx,
  text,
  font,
}: {
  ctx: CanvasRenderingContext2D;
  text: string;
  font?: string;
}): { width: number; height: number } => {
  const metrics = measureText({ ctx, text, font });
  const height =
    metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
  return {
    width: metrics.width,
    height: height || 12, // fallback for browsers that don't support actualBoundingBox
  };
};

// Get comprehensive text dimensions
export const getTextDimensions = ({
  ctx,
  text,
  font,
}: {
  ctx: CanvasRenderingContext2D;
  text: string;
  font?: string;
}): {
  width: number;
  height: number;
  baseline: number;
  ascent: number;
  descent: number;
} => {
  const metrics = measureText({ ctx, text, font });
  const ascent =
    metrics.actualBoundingBoxAscent || metrics.fontBoundingBoxAscent || 10;
  const descent =
    metrics.actualBoundingBoxDescent || metrics.fontBoundingBoxDescent || 2;

  return {
    width: metrics.width,
    height: ascent + descent,
    baseline: ascent,
    ascent,
    descent,
  };
};

// Center text in a rectangle
export const centerTextInRect = ({
  ctx,
  text,
  rect,
  font,
}: {
  ctx: CanvasRenderingContext2D;
  text: string;
  rect: AABB;
  font?: string;
}): Pt => {
  const dimensions = getTextDimensions({ ctx, text, font });
  const centerX = (rect.minX + rect.maxX) / 2 - dimensions.width / 2;
  const centerY = (rect.minY + rect.maxY) / 2 + dimensions.baseline / 2;
  return { x: centerX, y: centerY };
};

// Align text in a box with different alignment options
export const alignTextInBox = ({
  ctx,
  text,
  box,
  alignment,
  font,
}: {
  ctx: CanvasRenderingContext2D;
  text: string;
  box: { position: Pt; width: number; height: number };
  alignment: 'left' | 'center' | 'right';
  font?: string;
}): Pt => {
  const dimensions = getTextDimensions({ ctx, text, font });
  let x = box.position.x;

  switch (alignment) {
    case 'left':
      x = box.position.x;
      break;
    case 'center':
      x = box.position.x + (box.width - dimensions.width) / 2;
      break;
    case 'right':
      x = box.position.x + box.width - dimensions.width;
      break;
  }

  // Center vertically
  const y = box.position.y + box.height / 2 + dimensions.baseline / 2;

  return { x, y };
};
