// Common type definitions for the Melete library

import { DrawingSurface } from "./drawingSurface";

export type RenderContext =
    | CanvasRenderingContext2D
    | OffscreenCanvasRenderingContext2D;

export type RenderSupport<T> = {
    surf: DrawingSurface;
    ctx?: RenderContext;
    namedLocations: Record<string, NamedLocation>;
    geom: T;
};

export type ResizePolicy = "static" | "fullscreen" | ResizeFunction;
export type ResizePolicyStrings = Extract<ResizePolicy, string>;
export type ResizePolicyMap = Record<ResizePolicyStrings, ResizeFunction>;
export type ResizeFunction = (canvas: HTMLCanvasElement) => Size;

export type Size = {
    width: number;
    height: number;
};

export type Key = {
    // Represents a keyboard key
    symbol: string;
};

export type Pt = {
    x: number;
    y: number;
};

// similar to Pt, except semantics are of deltas/offsets/distances
export type Vec = {
    dx: number;
    dy: number;
};

// exactly like Vec! but intended to be for magnitude = 1
export type Dir = {
    dx: number;
    dy: number;
};

export type LineOp = {
    from: Pt;
    to: Pt;
};

export type ImageBuffer = {
    data: number[];
    colorSpace: string;
    size: Size;
};

export type ImageBufferOp = {
    buffer: ImageBuffer;
    // position, size?
};

export type PenOp = {
    stroke?: string;
    thickness?: number;
    fill?: string;
};

export type TurtleOp =
    | { op: "name"; name: string }
    | { op: "move"; move: number }
    | { op: "turn"; turn: number | RotationSpec }
    | { op: "pushState"; pushState: string }
    | { op: "penState"; penState: "up" | "down" }
    | { op: "popState"; popState: string }
    | { op: "pen"; pen: PenOp }
    | { op: "face"; face: string };

export type TurtleSequenceOp = Array<TurtleOp>;

export type DrawOp = {
    name?: string;
    pen?: PenOp;
    line?: LineOp;
    turtles?: TurtleSequenceOp;
    geometry?: Array<DrawOp>;
    image?: ImageBufferOp;
};

export type RotationSpec = {
    radians?: number;
    degrees?: number;
};

export type CameraSpec = {
    zoom?: number;
    pan?: Vec;
    rotate?: number | RotationSpec;
};

export type NamedLocation = {
    position: Pt;
    direction: Dir;
};

export type EventHandlers = {
    mouseDown?: (pt: Pt) => void;
    mouseDragged?: (pt: Pt) => void;
    keyPressed?: (k: Key) => void;
};

/**
 * This is a 2D Matrix utility to manage turtle transformations and camera. It
 * follows the naming convention found in DOMMatrix that is used by the HTML
 * Canvas API. We only record six values because those are the only ones we need
 * to do 2D transformations. The rest are derived from these values. These
 * values look like the following if drawn as a matrix:
 *
 * ```
 * [ a c e ]
 * [ b d f ]
 * [ 0 0 1 ]
 * ```
 */
export type Matrix = {
    a: number;
    b: number;
    c: number;
    d: number;
    e: number;
    f: number;
};
