import { Canvas } from './canvas';
import {
  LayerConfig,
  LayerCallbackContext,
  LayerOnDemandCallback,
  LayerOnTickCallback,
  DrawRectParams,
  DrawCircleParams,
  DrawTextParams,
  DrawLineParams,
  DrawingStyle,
} from './types';

export class DrawingLayer<T = any> {
  private config: LayerConfig;
  private onDemandCallback?: LayerOnDemandCallback<T>;
  private onTickCallback?: LayerOnTickCallback<T>;
  private canvas: Canvas;
  private model: T;
  private persistentStyle: DrawingStyle = {};

  constructor(_name: string, config: LayerConfig, canvas: Canvas, model: T) {
    this.config = { ...config };
    this.canvas = canvas;
    this.model = model;
  }

  // Register callback for on-demand rendering
  onDemand(callback: LayerOnDemandCallback<T>): void {
    this.onDemandCallback = callback;
  }

  // Register callback for tick-based rendering (animations)
  onTick(callback: LayerOnTickCallback<T>): void {
    this.onTickCallback = callback;
  }

  // Create a new layer with overridden configuration
  withConfig(newConfig: Partial<LayerConfig>): DrawingLayer<T> {
    const mergedConfig = { ...this.config, ...newConfig };
    const newLayer = new DrawingLayer<T>(
      '',
      mergedConfig,
      this.canvas,
      this.model
    );
    newLayer.onDemandCallback = this.onDemandCallback;
    newLayer.onTickCallback = this.onTickCallback;
    return newLayer;
  }

  // Render this layer (called by DrawingSurface)
  render(tick?: number): void {
    const ctx = this.canvas.getContext();

    // Save canvas state to isolate layer styles
    ctx.save();

    try {
      const context: LayerCallbackContext<T> = {
        model: this.model,
        tick,
        layer: this,
      };

      // Clear canvas if this layer has offscreen buffer (future enhancement)
      if (this.config.offscreen) {
        // TODO: Implement offscreen canvas support
      }

      // Call onTick callback if provided and tick is available
      if (this.onTickCallback && tick !== undefined) {
        this.onTickCallback(context);
      }

      // Call onDemand callback if provided
      if (this.onDemandCallback) {
        this.onDemandCallback(context);
      }
    } finally {
      // Always restore canvas state after layer rendering
      ctx.restore();
    }
  }

  // Get the underlying canvas for drawing operations
  getCanvas(): Canvas {
    return this.canvas;
  }

  // Get layer configuration
  getConfig(): LayerConfig {
    return { ...this.config };
  }

  // Update the model reference (called by DrawingSurface when model changes)
  updateModel(model: T): void {
    this.model = model;
  }

  // Semantic drawing methods
  drawRect(params: DrawRectParams & DrawingStyle): void {
    const ctx = this.canvas.getContext();

    const x = params.topLeft.x;
    const y = params.topLeft.y;
    const width = params.size.width;
    const height = params.size.height;

    // Apply styling and draw
    this.applyStyleAndDraw(ctx, params, () => {
      ctx.rect(x, y, width, height);
    });
  }

  drawCircle(params: DrawCircleParams & DrawingStyle): void {
    const ctx = this.canvas.getContext();

    // Apply styling and draw
    this.applyStyleAndDraw(ctx, params, () => {
      ctx.arc(params.center.x, params.center.y, params.radius, 0, 2 * Math.PI);
    });
  }

  // Helper method to apply styling and perform fill/stroke operations
  private applyStyleAndDraw(
    ctx: CanvasRenderingContext2D,
    style: DrawingStyle,
    drawPath: () => void
  ): void {
    ctx.beginPath();
    drawPath();

    // Apply fill if requested
    if (style.fill) {
      if (style.color) {
        ctx.fillStyle = style.color;
      }
      ctx.fill();
    }

    // Apply stroke if requested
    if (style.stroke) {
      if (style.strokeColor) {
        ctx.strokeStyle = style.strokeColor;
      }
      if (style.strokeThickness !== undefined) {
        ctx.lineWidth = style.strokeThickness;
      }
      ctx.stroke();
    }
  }

  // Clear canvas with optional background color
  clear(color?: string): void {
    const ctx = this.canvas.getContext();
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    if (color) {
      ctx.fillStyle = color;
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    }
  }

  // Set persistent style properties
  setStyle(style: DrawingStyle): void {
    // Merge new style with persistent style
    // null values should clear the property to default
    Object.keys(style).forEach(key => {
      const styleKey = key as keyof DrawingStyle;
      const value = style[styleKey];
      if (value === null || value === undefined) {
        delete this.persistentStyle[styleKey];
      } else {
        (this.persistentStyle as any)[styleKey] = value;
      }
    });
  }

  // Draw text with semantic parameters
  drawText(params: DrawTextParams & DrawingStyle): void {
    const ctx = this.canvas.getContext();

    // Merge persistent style with local style
    const mergedStyle = { ...this.persistentStyle, ...params };

    // Apply text styling
    if (mergedStyle.font) {
      ctx.font = mergedStyle.font;
    }
    if (mergedStyle.textColor) {
      ctx.fillStyle = mergedStyle.textColor;
    } else if (mergedStyle.color) {
      ctx.fillStyle = mergedStyle.color;
    }

    ctx.fillText(params.text, params.position.x, params.position.y);
  }

  // Draw line with semantic parameters
  drawLine(params: DrawLineParams & DrawingStyle): void {
    const ctx = this.canvas.getContext();

    // Apply styling and draw
    this.applyStyleAndDraw(ctx, params, () => {
      ctx.moveTo(params.from.x, params.from.y);
      ctx.lineTo(params.to.x, params.to.y);
    });
  }
}
