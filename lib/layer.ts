import { Canvas } from './canvas';
import {
  LayerConfig,
  LayerCallbackContext,
  LayerOnDemandCallback,
  LayerOnTickCallback,
  DrawRectParams,
  DrawCircleParams,
} from './types';

export class DrawingLayer<T = any> {
  private config: LayerConfig;
  private onDemandCallback?: LayerOnDemandCallback<T>;
  private onTickCallback?: LayerOnTickCallback<T>;
  private canvas: Canvas;
  private model: T;

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
  drawRect(params: DrawRectParams): void {
    const ctx = this.canvas.getContext();

    if (params.color) {
      if (params.fill) {
        ctx.fillStyle = params.color;
      } else {
        ctx.strokeStyle = params.color;
      }
    }

    const x = params.topLeft.x;
    const y = params.topLeft.y;
    const width = params.size.width;
    const height = params.size.height;

    if (params.fill) {
      ctx.fillRect(x, y, width, height);
    } else {
      ctx.strokeRect(x, y, width, height);
    }
  }

  drawCircle(params: DrawCircleParams): void {
    const ctx = this.canvas.getContext();

    if (params.color) {
      if (params.fill) {
        ctx.fillStyle = params.color;
      } else {
        ctx.strokeStyle = params.color;
      }
    }

    ctx.beginPath();
    ctx.arc(params.center.x, params.center.y, params.radius, 0, 2 * Math.PI);

    if (params.fill) {
      ctx.fill();
    } else {
      ctx.stroke();
    }
  }
}
