/**
 * Core types for the Melete graphics library
 */

// Re-export commonly used geometric types for convenience
export type { Pt, Vec, Size } from './geom/types';

// Canvas and drawing types
export interface CanvasOptions {
  width: number;
  height: number;
}

// Layer system types
export interface LayerConfig {
  cache: boolean;
  offscreen: boolean;
  animated?: boolean;
}

export type LayerSchema = Record<string, LayerConfig>;

// Callback function types for layers
export interface LayerCallbackContext<T = any> {
  model: T;
  tick?: number;
  layer: any; // Will be DrawingLayer when implemented
}

export type LayerOnDemandCallback<T = any> = (
  context: LayerCallbackContext<T>
) => void;
export type LayerOnTickCallback<T = any> = (
  context: LayerCallbackContext<T>
) => void;

// Drawing surface configuration
export interface DrawingSurfaceConfig<
  T = any,
  S extends LayerSchema = LayerSchema,
> {
  model: T;
  layerSchema: S;
  canvasOptions?: CanvasOptions;
  container?: HTMLElement;
}
