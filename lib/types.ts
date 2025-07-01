/**
 * Core types for the Melete graphics library
 */

// Basic geometric types
export interface Point {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

// Canvas and drawing types
export interface CanvasOptions {
  width: number;
  height: number;
}

export type Color = string;
export type Font = string;

// Layer system types
export interface LayerConfig {
  cache: boolean;
  offscreen: boolean;
}

export type LayerSchema = Record<string, LayerConfig>;

// Callback function types for layers
export interface LayerCallbackContext<T = any> {
  model: T;
  tick?: number;
  layer: any; // Will be DrawingLayer when implemented
}

export type LayerOnDemandCallback<T = any> = (context: LayerCallbackContext<T>) => void;
export type LayerOnTickCallback<T = any> = (context: LayerCallbackContext<T>) => void;

// Drawing surface configuration
export interface DrawingSurfaceConfig<T = any, S extends LayerSchema = LayerSchema> {
  model: T;
  layerSchema: S;
  canvasOptions?: CanvasOptions;
  container?: HTMLElement;
}
