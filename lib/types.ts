/**
 * Core types for the Melete graphics library
 */

import { DrawingLayer } from './layer';

// Re-export commonly used geometric types for convenience
export type { Pt, Vec, Size } from './geom/types';

// Canvas and drawing types
export interface CanvasOptions {
  width: number;
  height: number;
}

// Union type for canvas elements that can be either HTML or OffscreenCanvas
export type CanvasElement = HTMLCanvasElement | OffscreenCanvas;

// Layer system types
export interface LayerConfig {
  cache: boolean;
  offscreen: boolean;
  animated?: boolean;
}

export type LayerSchema = Record<string, LayerConfig>;

// Callback function types for layers
export interface LayerCallbackContext<T> {
  model: T;
  tick?: number;
  layer: DrawingLayer<T>;
}

export type LayerOnDemandCallback<T> = (
  context: LayerCallbackContext<T>
) => void;
export type LayerOnTickCallback<T> = (context: LayerCallbackContext<T>) => void;

// Drawing surface configuration
export interface DrawingSurfaceConfig<T, S extends LayerSchema = LayerSchema> {
  model: T;
  layerSchema: S;
  canvasOptions?: CanvasOptions;
  container?: HTMLElement;
}
