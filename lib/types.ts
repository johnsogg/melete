/**
 * Core types for the Melete graphics library
 */

// Basic geometric types - support 2D and 3D
export interface Pt {
  x: number;
  y: number;
  z?: number;
}

export interface Vec {
  dx: number;
  dy: number;
  dz?: number;
}

export interface Size {
  width: number;
  height: number;
}

// Backward compatibility
export type Point = Pt;

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

export type LayerOnDemandCallback<T = any> = (
  context: LayerCallbackContext<T>
) => void;
export type LayerOnTickCallback<T = any> = (
  context: LayerCallbackContext<T>
) => void;

// Drawing method parameter interfaces
export interface DrawRectParams {
  topLeft: Pt;
  size: Size;
  fill?: boolean;
  color?: Color;
}

export interface DrawCircleParams {
  center: Pt;
  radius: number;
  fill?: boolean;
  color?: Color;
}

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
