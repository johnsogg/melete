import { Canvas } from './canvas';
import {
  LayerConfig,
  LayerCallbackContext,
  LayerOnDemandCallback,
  LayerOnTickCallback,
  CanvasElement,
} from './types';
import {
  DrawRectParams,
  DrawCircleParams,
  DrawTextParams,
  DrawLineParams,
  DrawRoundedRectParams,
  DrawCurvedEdgeParams,
  DrawArrowheadParams,
  DrawPolygonParams,
  DrawTriangleParams,
  Size,
} from './geom/types';
import { DrawingStyle } from './graphics/types';
import {
  drawRectStyled,
  drawCircleStyled,
  drawLineStyled,
  drawTextStyled,
  drawRoundedRectStyled,
  drawCurvedEdgeStyled,
  drawArrowheadStyled,
  drawPolygonStyled,
  drawTriangleStyled,
  clearCanvas,
  measureText as measureTextUtil,
  getTextBounds as getTextBoundsUtil,
  getTextDimensions as getTextDimensionsUtil,
} from './graphics';
import {
  TurtleCommand,
  TurtleState,
  generateTurtlePath,
  renderTurtlePath,
  executeTurtleSequence,
} from './turtle';
import { HitTestRegistry, HitTestData } from './hit-test';
import { Pt } from './geom';

export class DrawingLayer<T> {
  private config: LayerConfig;
  private onDemandCallback?: LayerOnDemandCallback<T>;
  private onTickCallback?: LayerOnTickCallback<T>;
  private canvas: Canvas;
  private model: T;
  private persistentStyle: DrawingStyle = {};

  // Cache management
  private cachedCanvas: OffscreenCanvas | null = null;
  private cacheValid: boolean = false;
  private lastModelHash: string = '';

  // Hit testing
  private hitTestRegistry: HitTestRegistry = new HitTestRegistry();

  constructor(_name: string, config: LayerConfig, canvas: Canvas, model: T) {
    this.config = { ...config };
    this.canvas = canvas;
    this.model = model;
  }

  // Create a simple hash of the model for cache invalidation
  private createModelHash(model: T): string {
    try {
      return JSON.stringify(model);
    } catch (error) {
      // If model cannot be serialized, use a timestamp to force cache invalidation
      return Date.now().toString();
    }
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
      // Check if we can use cached version (only for non-animated layers)
      if (this.config.cache && !this.config.animated && tick === undefined) {
        const currentModelHash = this.createModelHash(this.model);

        // If cache is valid and model hasn't changed, use cached version
        if (
          this.cacheValid &&
          this.cachedCanvas &&
          this.lastModelHash === currentModelHash
        ) {
          // Draw cached image to main canvas
          ctx.drawImage(this.cachedCanvas, 0, 0);
          return;
        }

        // Cache is invalid or doesn't exist, need to render and cache
        if (this.renderToCache()) {
          // Successfully cached, draw from cache
          ctx.drawImage(this.cachedCanvas!, 0, 0);
          this.cacheValid = true;
          this.lastModelHash = currentModelHash;
          return;
        }
        // If caching failed, fall through to normal rendering
      }

      // Normal rendering (for animated layers or when caching is disabled/failed)

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

  // Render layer to offscreen canvas for caching
  private renderToCache(): boolean {
    try {
      const mainCanvas = this.canvas.getContext().canvas;

      // Create or reuse offscreen canvas with same dimensions as main canvas
      if (
        !this.cachedCanvas ||
        this.cachedCanvas.width !== mainCanvas.width ||
        this.cachedCanvas.height !== mainCanvas.height
      ) {
        this.cachedCanvas = new OffscreenCanvas(
          mainCanvas.width,
          mainCanvas.height
        );
      }

      const offscreenCtx = this.cachedCanvas.getContext('2d');
      if (!offscreenCtx) {
        return false;
      }

      // Clear the offscreen canvas
      offscreenCtx.clearRect(
        0,
        0,
        this.cachedCanvas.width,
        this.cachedCanvas.height
      );

      // Save context state
      offscreenCtx.save();

      try {
        // Create a temporary canvas wrapper for the offscreen context
        const tempCanvas = {
          canvas: this.cachedCanvas,
          ctx: offscreenCtx,
          getContext: () => offscreenCtx,
          clear: (color?: string) => {
            offscreenCtx.clearRect(
              0,
              0,
              this.cachedCanvas!.width,
              this.cachedCanvas!.height
            );
            if (color) {
              offscreenCtx.fillStyle = color;
              offscreenCtx.fillRect(
                0,
                0,
                this.cachedCanvas!.width,
                this.cachedCanvas!.height
              );
            }
          },
          setFillColor: (color: string) => {
            offscreenCtx.fillStyle = color;
          },
          setStrokeColor: (color: string) => {
            offscreenCtx.strokeStyle = color;
          },
          setFont: (font: string) => {
            offscreenCtx.font = font;
          },
          fillRect: (x: number, y: number, width: number, height: number) => {
            offscreenCtx.fillRect(x, y, width, height);
          },
          strokeRect: (x: number, y: number, width: number, height: number) => {
            offscreenCtx.strokeRect(x, y, width, height);
          },
          fillCircle: (x: number, y: number, radius: number) => {
            offscreenCtx.beginPath();
            offscreenCtx.arc(x, y, radius, 0, 2 * Math.PI);
            offscreenCtx.fill();
          },
          strokeCircle: (x: number, y: number, radius: number) => {
            offscreenCtx.beginPath();
            offscreenCtx.arc(x, y, radius, 0, 2 * Math.PI);
            offscreenCtx.stroke();
          },
          fillText: (text: string, x: number, y: number) => {
            offscreenCtx.fillText(text, x, y);
          },
          strokeText: (text: string, x: number, y: number) => {
            offscreenCtx.strokeText(text, x, y);
          },
          getWidth: () => this.cachedCanvas!.width,
          getHeight: () => this.cachedCanvas!.height,
          getElement: (): CanvasElement => this.cachedCanvas!,
        };

        // Temporarily replace canvas with offscreen version
        const originalCanvas = this.canvas;
        this.canvas = tempCanvas as unknown as Canvas;

        try {
          const context: LayerCallbackContext<T> = {
            model: this.model,
            tick: undefined,
            layer: this,
          };

          // Render to offscreen canvas using onDemand callback
          if (this.onDemandCallback) {
            this.onDemandCallback(context);
          }

          return true;
        } finally {
          // Always restore original canvas
          this.canvas = originalCanvas;
        }
      } finally {
        // Always restore offscreen context state
        offscreenCtx.restore();
      }
    } catch (error) {
      console.warn('Failed to render layer to cache:', error);
      return false;
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
    // Invalidate cache when model changes
    this.invalidateCache();
  }

  // Manually invalidate the cache
  invalidateCache(): void {
    this.cacheValid = false;
    this.lastModelHash = '';
  }

  // Check if cache is currently valid
  isCacheValid(): boolean {
    return this.cacheValid && this.cachedCanvas !== null;
  }

  // Clean up resources
  destroy(): void {
    // Clear cached canvas
    this.cachedCanvas = null;
    this.cacheValid = false;
    this.lastModelHash = '';

    // Clear callbacks
    this.onDemandCallback = undefined;
    this.onTickCallback = undefined;

    // Clear hit test data
    this.hitTestRegistry.clear();
  }

  // Semantic drawing methods
  drawRect(params: DrawRectParams & DrawingStyle): void {
    const ctx = this.canvas.getContext();
    drawRectStyled({
      ctx,
      topLeft: params.topLeft,
      width: params.size.width,
      height: params.size.height,
      style: params,
    });
  }

  drawCircle(params: DrawCircleParams & DrawingStyle): void {
    const ctx = this.canvas.getContext();
    drawCircleStyled({
      ctx,
      center: params.center,
      radius: params.radius,
      style: params,
    });
  }

  // Clear canvas with optional background color
  clear(color?: string): void {
    const ctx = this.canvas.getContext();
    clearCanvas({ ctx, color });
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
        // Type-safe assignment using proper key constraint
        (this.persistentStyle as Record<keyof DrawingStyle, unknown>)[
          styleKey
        ] = value;
      }
    });
  }

  // Draw text with semantic parameters
  drawText(params: DrawTextParams & DrawingStyle): void {
    const ctx = this.canvas.getContext();
    const mergedStyle = { ...this.persistentStyle, ...params };
    drawTextStyled({
      ctx,
      text: params.text,
      position: params.position,
      style: mergedStyle,
    });
  }

  // Draw line with semantic parameters
  drawLine(params: DrawLineParams & DrawingStyle): void {
    const ctx = this.canvas.getContext();
    drawLineStyled({ ctx, start: params.from, end: params.to, style: params });
  }

  // Draw rounded rectangle with semantic parameters
  drawRoundedRect(params: DrawRoundedRectParams & DrawingStyle): void {
    const ctx = this.canvas.getContext();
    drawRoundedRectStyled({
      ctx,
      bounds: params.bounds,
      radius: params.radius,
      style: params,
    });
  }

  // Draw curved edge with semantic parameters
  drawCurvedEdge(params: DrawCurvedEdgeParams & DrawingStyle): void {
    const ctx = this.canvas.getContext();
    drawCurvedEdgeStyled({
      ctx,
      bezier: params.bezier,
      style: params,
    });
  }

  // Draw arrowhead with semantic parameters
  drawArrowhead(params: DrawArrowheadParams & DrawingStyle): void {
    const ctx = this.canvas.getContext();
    drawArrowheadStyled({
      ctx,
      ray: params.ray,
      arrowStyle: params.arrowStyle,
      size: params.size,
      style: params,
    });
  }

  // Draw polygon with semantic parameters
  drawPolygon(params: DrawPolygonParams & DrawingStyle): void {
    const ctx = this.canvas.getContext();
    drawPolygonStyled({
      ctx,
      points: params.points,
      style: params,
    });
  }

  // Draw triangle with semantic parameters
  drawTriangle(params: DrawTriangleParams & DrawingStyle): void {
    const ctx = this.canvas.getContext();
    drawTriangleStyled({
      ctx,
      p1: params.p1,
      p2: params.p2,
      p3: params.p3,
      style: params,
    });
  }

  // Turtle graphics method
  turtle(
    commands: TurtleCommand[],
    options?: {
      initialState?: TurtleState;
      strokeStyle?: string;
      lineWidth?: number;
      lineCap?: CanvasLineCap;
      lineJoin?: CanvasLineJoin;
    }
  ): TurtleState {
    const ctx = this.canvas.getContext();

    // Generate path from turtle commands and get final state
    const path = generateTurtlePath(commands, options?.initialState);

    // Also execute the commands to get the proper final state with orientation
    const finalState = executeTurtleSequence(commands, options?.initialState);

    // Render the path to canvas
    const style = {
      strokeStyle: options?.strokeStyle,
      lineWidth: options?.lineWidth,
      lineCap: options?.lineCap,
      lineJoin: options?.lineJoin,
    };

    renderTurtlePath(ctx, path, style);

    return finalState;
  }

  // Text measurement methods
  measureText(text: string, font?: string): TextMetrics {
    const ctx = this.canvas.getContext();
    return measureTextUtil({ ctx, text, font });
  }

  getTextBounds(text: string, font?: string): Size {
    const ctx = this.canvas.getContext();
    return getTextBoundsUtil({ ctx, text, font });
  }

  getTextDimensions(
    text: string,
    font?: string
  ): {
    width: number;
    height: number;
    baseline: number;
    ascent: number;
    descent: number;
  } {
    const ctx = this.canvas.getContext();
    return getTextDimensionsUtil({ ctx, text, font });
  }

  // Hit testing methods (only available if layer is configured as hittable)
  addHitTestData(data: HitTestData): void {
    if (!this.config.hittable) {
      console.warn(
        'Layer is not configured as hittable. Set hittable: true in LayerConfig.'
      );
      return;
    }
    this.hitTestRegistry.add(data);
  }

  removeHitTestData(id: string): void {
    if (!this.config.hittable) return;
    this.hitTestRegistry.remove(id);
  }

  clearHitTestData(): void {
    if (!this.config.hittable) return;
    this.hitTestRegistry.clear();
  }

  findObjectsAt(point: Pt): HitTestData[] {
    if (!this.config.hittable) return [];
    return this.hitTestRegistry.findObjectsAt(point);
  }

  findFirstObjectAt(point: Pt): HitTestData | null {
    if (!this.config.hittable) return null;
    return this.hitTestRegistry.findFirstObjectAt(point);
  }

  isHittable(): boolean {
    return this.config.hittable === true;
  }
}
