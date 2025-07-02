import { Canvas, createCanvas } from './canvas';
import { DrawingLayer } from './layer';
import { DrawingSurfaceConfig, LayerSchema, CanvasOptions } from './types';

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

export class DrawingSurface<T = any, S extends LayerSchema = LayerSchema> {
  private model: T;
  private layerSchema: S;
  private canvas: Canvas;
  private canvasElement: HTMLCanvasElement;
  private layers: Map<keyof S, DrawingLayer<T>> = new Map();
  private layerVisibility: Map<keyof S, boolean> = new Map();
  private clickHandlers: MouseEventHandler[] = [];

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

    // Update model reference in all layers
    for (const layer of this.layers.values()) {
      layer.updateModel(newModel);
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

  // Clean up resources
  destroy(): void {
    // Remove canvas from DOM
    if (this.canvasElement.parentNode) {
      this.canvasElement.parentNode.removeChild(this.canvasElement);
    }

    // Clear event listeners
    this.clickHandlers.length = 0;
  }
}
