/**
 * Melete - A simple 2D graphics library for the web.
 */

// Export main classes
export { Melete } from "./melete";
export { DrawingSurface } from "./drawingSurface";

// Export types
export type {
    ResizePolicy,
    ResizeFunction,
    Size,
    Pt,
    Vec,
    Dir,
    LineOp,
    PenOp,
    TurtleOp,
    TurtleSequenceOp,
    DrawOp,
    RotationSpec,
    CameraSpec,
    NamedLocation,
    EventHandlers,
    Matrix,
} from "./types";

// Export matrix utilities that may be useful for consumers
export {
    identityMatrix,
    translationMatrix,
    rotationMatrix,
    degreesToRadians,
    rotationMatrixDegrees,
    scaleMatrix,
    multiplyMatrices,
    transformPoint,
    transformVector,
    transformDirection,
    createTransformMatrix,
} from "./matrix";
