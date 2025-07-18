import { Canvas, createCanvas } from './canvas';
import { DrawingLayer } from './layer';
import { DrawingSurfaceConfig, LayerSchema, CanvasOptions } from './types';
import { HitTestData } from './hit-test';
import { Pt } from './geom';

// Event handling types
export interface MeleteMouseEvent {
  canvasX: number;
  canvasY: number;
  button: number;
  shiftKey: boolean;
  ctrlKey: boolean;
  altKey: boolean;
  metaKey: boolean;
  rawEvent: MouseEvent;
}

export type MouseEventHandler = (event: MeleteMouseEvent) => void;

export class DrawingSurface<T, S extends LayerSchema = LayerSchema> {
  private model: T;
  private layerSchema: S;
  private canvas: Canvas;
  private canvasElement: HTMLCanvasElement;
  private layers: Map<keyof S, DrawingLayer<T>> = new Map();
  private layerVisibility: Map<keyof S, boolean> = new Map();
  private clickHandlers: MouseEventHandler[] = [];
  private animationId?: number;
  private currentTick: number = 0;
  private hasAnimatedLayers: boolean = false;

  constructor(config: DrawingSurfaceConfig<T, S>) {
    this.model = config.model;
    this.layerSchema = config.layerSchema;

    // Create canvas element and add to DOM
    this.canvasElement = document.createElement('canvas');
    const container = config.container || document.body;
    container.appendChild(this.canvasElement);

    // Set up canvas with options
    const canvasOptions: CanvasOptions = config.canvasOptions || {
      width: 800,
      height: 600,
    };

    this.canvas = createCanvas(this.canvasElement, canvasOptions);

    // Create layers based on schema
    this.createLayers();

    // Start animation if any layers are animated
    if (this.hasAnimatedLayers) {
      this.startAnimation();
    }

    // Initial render will be triggered by rerender() call after setup
  }

  private createLayers(): void {
    const layerNames = Object.keys(this.layerSchema) as (keyof S)[];

    for (const layerName of layerNames) {
      const layerConfig = this.layerSchema[layerName];
      const layer = new DrawingLayer<T>(
        String(layerName),
        layerConfig,
        this.canvas,
        this.model
      );
      this.layers.set(layerName, layer);
      // Initialize layer as visible by default
      this.layerVisibility.set(layerName, true);

      // Check if any layer is animated
      if (layerConfig.animated) {
        this.hasAnimatedLayers = true;
      }
    }
  }

  // Type-safe layer access
  getLayer<K extends keyof S>(layerName: K): DrawingLayer<T> {
    const layer = this.layers.get(layerName);
    if (!layer) {
      throw new Error(`Layer '${String(layerName)}' not found`);
    }
    return layer;
  }

  // Update the model and mark for rerender
  setModel(newModel: T): void {
    this.model = newModel;

    // Update model reference in all layers (this will invalidate caches)
    for (const layer of this.layers.values()) {
      layer.updateModel(newModel);
    }

    // Trigger rerender if not in animation mode
    if (!this.hasAnimatedLayers) {
      this.rerender();
    }
  }

  // Manually invalidate all layer caches
  invalidateAllCaches(): void {
    for (const layer of this.layers.values()) {
      layer.invalidateCache();
    }
  }

  // Get current model
  getModel(): T {
    return this.model;
  }

  // Render all layers
  render(tick?: number): void {
    // Clear canvas
    this.canvas.clear();

    // Render layers in schema order, but only if visible
    const layerNames = Object.keys(this.layerSchema) as (keyof S)[];

    for (const layerName of layerNames) {
      const layer = this.layers.get(layerName);
      const isVisible = this.layerVisibility.get(layerName) ?? true;

      if (layer && isVisible) {
        layer.render(tick);
      }
    }
  }

  // Request a rerender on next frame
  rerender(): void {
    requestAnimationFrame(() => {
      this.render();
    });
  }

  // Event handling - onClick
  onClick(handler: MouseEventHandler): void {
    this.clickHandlers.push(handler);

    // Register DOM event listener if this is the first handler
    if (this.clickHandlers.length === 1) {
      this.canvasElement.addEventListener('click', this.handleClick.bind(this));
    }
  }

  private handleClick(rawEvent: MouseEvent): void {
    const meleteEvent = this.createMeleteMouseEvent(rawEvent);

    for (const handler of this.clickHandlers) {
      handler(meleteEvent);
    }
  }

  private createMeleteMouseEvent(rawEvent: MouseEvent): MeleteMouseEvent {
    const rect = this.canvasElement.getBoundingClientRect();

    return {
      canvasX: rawEvent.clientX - rect.left,
      canvasY: rawEvent.clientY - rect.top,
      button: rawEvent.button,
      shiftKey: rawEvent.shiftKey,
      ctrlKey: rawEvent.ctrlKey,
      altKey: rawEvent.altKey,
      metaKey: rawEvent.metaKey,
      rawEvent,
    };
  }

  // Get the underlying canvas for direct access if needed
  getCanvas(): Canvas {
    return this.canvas;
  }

  // Layer visibility control
  setLayerVisible(layerName: keyof S, visible: boolean): void {
    this.layerVisibility.set(layerName, visible);
  }

  // Get layer visibility state
  isLayerVisible(layerName: keyof S): boolean {
    return this.layerVisibility.get(layerName) ?? true;
  }

  // Get all layer names in render order
  getLayerNames(): (keyof S)[] {
    return Object.keys(this.layerSchema) as (keyof S)[];
  }

  // Get the total number of layers
  countLayers(): number {
    return Object.keys(this.layerSchema).length;
  }

  // Animation methods
  private startAnimation(): void {
    const animate = () => {
      this.currentTick++;
      this.render(this.currentTick);
      this.animationId = requestAnimationFrame(animate);
    };

    this.animationId = requestAnimationFrame(animate);
  }

  private stopAnimation(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = undefined;
    }
  }

  // Hit testing methods - test layers in reverse z-order (top to bottom)
  findObjectsAt(
    point: Pt
  ): Array<{ layerName: keyof S; objects: HitTestData[] }> {
    const results: Array<{ layerName: keyof S; objects: HitTestData[] }> = [];

    // Get layer names in reverse order (top layer first)
    const layerNames = Object.keys(this.layerSchema) as (keyof S)[];
    const reversedLayerNames = [...layerNames].reverse();

    for (const layerName of reversedLayerNames) {
      const layer = this.layers.get(layerName);
      const isVisible = this.layerVisibility.get(layerName) ?? true;

      if (layer && isVisible && layer.isHittable()) {
        const objects = layer.findObjectsAt(point);
        if (objects.length > 0) {
          results.push({ layerName, objects });
        }
      }
    }

    return results;
  }

  findFirstObjectAt(
    point: Pt
  ): { layerName: keyof S; object: HitTestData } | null {
    // Get layer names in reverse order (top layer first)
    const layerNames = Object.keys(this.layerSchema) as (keyof S)[];
    const reversedLayerNames = [...layerNames].reverse();

    for (const layerName of reversedLayerNames) {
      const layer = this.layers.get(layerName);
      const isVisible = this.layerVisibility.get(layerName) ?? true;

      if (layer && isVisible && layer.isHittable()) {
        const object = layer.findFirstObjectAt(point);
        if (object) {
          return { layerName, object };
        }
      }
    }

    return null;
  }

  // Convenience method to find objects at mouse event position
  findObjectsAtMouseEvent(
    event: MeleteMouseEvent
  ): Array<{ layerName: keyof S; objects: HitTestData[] }> {
    return this.findObjectsAt({ x: event.canvasX, y: event.canvasY });
  }

  findFirstObjectAtMouseEvent(
    event: MeleteMouseEvent
  ): { layerName: keyof S; object: HitTestData } | null {
    return this.findFirstObjectAt({ x: event.canvasX, y: event.canvasY });
  }

  // Clean up resources
  destroy(): void {
    // Stop animation
    this.stopAnimation();

    // Destroy all layers
    for (const layer of this.layers.values()) {
      layer.destroy();
    }
    this.layers.clear();
    this.layerVisibility.clear();

    // Remove canvas from DOM
    if (this.canvasElement.parentNode) {
      this.canvasElement.parentNode.removeChild(this.canvasElement);
    }

    // Clear event listeners
    this.clickHandlers.length = 0;
  }
}
