/**
 * Graphics and drawing types for the Melete graphics library
 */

import { Pt } from '../geom/types';

export type Color = string;
export type Font = string;

// Drawing style interface - separate from geometry
export interface DrawingStyle {
  fill?: boolean;
  color?: Color;
  stroke?: boolean;
  strokeThickness?: number;
  strokeColor?: Color;
  font?: Font;
  textColor?: Color;
}

// Animation state interface
export interface AnimationState {
  isAnimating: boolean;
  startTime: number;
  duration: number;
  easing: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out';
  startPositions: { [boxId: string]: Pt };
}
