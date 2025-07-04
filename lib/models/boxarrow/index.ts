import { LayerSchema } from '../../types';
import { Pt } from '../../geom/types';
import { AnimationState } from '../../graphics/types';

// Box entity interface
export interface Box {
  id: string;
  label: string;
  position: Pt;
  targetPosition: Pt;
  width: number;
  height: number;
  borderColor: string;
  borderThickness: number;
  cornerRadius: number;
  fillColor: string;
  textColor: string;
  fontSize: number;
  fontFamily: string;
}

// Edge entity interface
export interface Edge {
  id: string;
  fromBoxId: string;
  toBoxId: string;
  strokeThickness: number;
  strokeColor: string;
  arrowheadStyle: 'v' | 'triangle';
  arrowheadSize: { width: number; length: number };
}

// Main model interface
export interface BoxArrowModel {
  boxes: Box[];
  edges: Edge[];
  animation: AnimationState;
  currentTick: number;
}

// Layer schema
export interface BoxArrowLayerSchema extends LayerSchema {
  boxes: { cache: boolean; offscreen: boolean; animated: boolean };
  arrows: { cache: boolean; offscreen: boolean; animated: boolean };
}

// Check if two boxes have bidirectional edges
export const hasBidirectionalEdges = (
  fromBoxId: string,
  toBoxId: string,
  edges: Edge[]
): boolean => {
  const forwardEdge = edges.find(
    e => e.fromBoxId === fromBoxId && e.toBoxId === toBoxId
  );
  const reverseEdge = edges.find(
    e => e.fromBoxId === toBoxId && e.toBoxId === fromBoxId
  );
  return !!(forwardEdge && reverseEdge);
};
