const _getCanvas = (canvasId: string) => {
    const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    return canvas;
};

// Create a type that requires all string keys with ResizeFunction values.
type ResizePolicyMap = Record<ResizePolicyStrings, ResizeFunction>;

// Extract just the string literal types from Melete<T>["resizePolicy"].
type ResizePolicyStrings = Extract<ResizePolicy, string>;

type ResizePolicy = "static" | "fullscreen" | ResizeFunction;

const _resizeFullScreen: ResizeFunction = (canvas: HTMLCanvasElement) => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    return {
        width: canvas.width,
        height: canvas.height,
    };
};

const _resizeCanvasOffset: ResizeFunction = (canvas: HTMLCanvasElement) => {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    return {
        width: canvas.width,
        height: canvas.height,
    };
};

const _resizePolicies: ResizePolicyMap = {
    fullscreen: _resizeFullScreen,
    static: _resizeCanvasOffset,
};

export class Melete<T = void> {
    private surfaces: DrawingSurface[];
    public readonly canvasId: string;
    public canvasSize: Size;
    public userModel?: T;

    constructor({
        domId,
        userModel,
        initialWidth = 800,
        initialHeight = 600,
        resizePolicy = "static",
    }: {
        domId: string;
        userModel?: T;
        initialWidth?: number;
        initialHeight?: number;
        resizePolicy?: ResizePolicy;
    }) {
        this.surfaces = [new DrawingSurface("default")];
        this.canvasId = `${domId}-meleteCanvas`;
        this.userModel = userModel;

        // check if there is a node with the given domId
        const node = document.querySelector(`#${domId}`);
        if (!node) {
            throw new Error(`Element with id "${domId}" not found.`);
        }
        this.canvasSize = { width: initialWidth, height: initialHeight };
        // establish the HTML canvas element
        document.querySelector<HTMLDivElement>(`#${domId}`)!.innerHTML = `
    <canvas 
      id="${this.canvasId}" 
      width="${initialWidth}" 
      height="${initialHeight}" 
      tabindex="0"></canvas>
  `;

        // when the window is resized, we might need to react
        const resize = () => {
            const canvas = _getCanvas(this.canvasId);
            if (!canvas) return;
            // Use the handler from the map or the function itself
            const handler =
                typeof resizePolicy === "string"
                    ? _resizePolicies[resizePolicy]
                    : resizePolicy;

            this.canvasSize = handler(canvas);
            this.draw();
        };

        window.addEventListener("load", resize);
        window.addEventListener("resize", resize);
    }

    protected getCanvas(): HTMLCanvasElement {
        const canvas = _getCanvas(this.canvasId);

        if (!canvas) {
            throw new Error(`Canvas with id "${this.canvasId}" not found.`);
        }
        // check if it is really a canvas
        if (!(canvas instanceof HTMLCanvasElement)) {
            throw new Error(
                `Element with id "${this.canvasId}" is not a canvas.`
            );
        }
        return canvas;
    }

    getDefaultLayer(): DrawingSurface {
        let def = this.surfaces.find((s) => s.name === "default");
        if (!def) {
            def = new DrawingSurface("default");
            this.surfaces.push(def);
        }
        return def;
    }

    createLayer(name: string): DrawingSurface {
        const existing = this.surfaces.find((s) => s.name === name);
        if (existing) {
            console.warn(`Creating another layer named "${name}"`);
        }
        const surf = new DrawingSurface(name);
        this.surfaces.push(surf);
        return surf;
    }

    draw() {
        // draw all surfaces in the order they appear in the array
        const canvas = this.getCanvas();
        const ctx = canvas.getContext("2d");
        if (!ctx) {
            throw new Error("Failed to get canvas context");
        }
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        this.surfaces.forEach((surf) => {
            // surf.redraw();
            surf.render(ctx);
            // surf.plan();
            // surf.animate();
        });
    }
}

export type ResizeFunction = (canvas: HTMLCanvasElement) => Size;

type Key = {
    // Represents a keyboard key. I am mega confused about how this has been
    // implemented in Javascript, with deprecated things all over the place, and
    // distinctions between key codes and key chars, etc. Punting.
    symbol: string;
};

type Pt = {
    x: number;
    y: number;
};

// similar to Pt, except semantics are of deltas/offsets/distances.
type Vec = {
    dx: number;
    dy: number;
};

// exactly like Vec! but intended to be for magnitude = 1.
type Dir = {
    dx: number;
    dy: number;
};

type LineOp = {
    from: Pt;
    to: Pt;
};

type ImageBufferOp = {
    buffer: ImageBuffer;
    // position, size?
};

type PenOp = {
    stroke?: string;
    thickness?: number;
    fill?: string;
};

type TurtleOp =
    | { op: "name"; name: string }
    | { op: "move"; move: number /*| DrawFunc*/ } // need to break up drawing surface so we can do read-only stuff as a separate data structure
    | { op: "turn"; turn: number | RotationSpec }
    | { op: "pushState"; pushState: string }
    | { op: "penState"; penState: "up" | "down" }
    | { op: "popState"; popState: string }
    | { op: "pen"; pen: PenOp }
    | { op: "face"; face: string };

type TurtleSequenceOp = Array<TurtleOp>;

type DrawOp = {
    name?: string;
    pen?: PenOp;
    line?: LineOp;
    turtles?: TurtleSequenceOp;
    geometry?: Array<DrawOp>;
    image?: ImageBufferOp;
};

// type DrawFunc = (
//   surface: DrawingSurface,
// ) => Record<string, NamedLocation> | void;

type RotationSpec = {
    radians?: number;
    degrees?: number;
};

type CameraSpec = {
    zoom?: number;
    pan?: Vec;
    rotate?: number | RotationSpec;
};

type NamedLocation = {
    position: Pt;
    direction: Dir;
};

type EventHandlers = {
    mouseDown?: (pt: Pt) => void;
    mouseDragged?: (pt: Pt) => void;
    keyPressed?: (k: Key) => void;
};

type Size = {
    width: number;
    height: number;
};

type ImageBuffer = {
    data: number[];
    colorSpace: string;
    size: Size;
};

class DrawingSurface {
    // time - these should go in the Melete class and made available to functions
    // that could use them.
    #tick: number = 0;
    #previousTick: number = 0;

    // drawing data
    #drawOps: Array<DrawOp /*| DrawFunc*/> = [];
    #xfm: Matrix = identityMatrix(); // need to build a little sub-library for matrix math

    public constructor(public readonly name: string) {}

    get tick() {
        return this.#tick;
    }

    get previousTick() {
        return this.#previousTick;
    }

    // executing on geometry
    draw(spec: DrawOp /*| DrawFunc*/): Record<string, NamedLocation> {
        this.#drawOps.push(spec);
        return this.execute(spec);
    }
    redraw() {}
    plan(_spec: DrawOp /*| DrawFunc*/): Record<string, NamedLocation> {
        return {};
    }
    // animate({ fps: _fps, draw: _draw }: { fps: number; draw: DrawFunc }) {}

    private execute(
        spec: DrawOp /*| DrawFunc*/,
        ctx?: OffscreenCanvasRenderingContext2D
    ): Record<string, NamedLocation> {
        const namedLocations: Record<string, NamedLocation> = {};

        // this is a draw op, so we need to run it.
        if (spec.line) {
            // this is a line operation
            const { from, to } = spec.line;
            const start = transformPoint(this.#xfm, from);
            const end = transformPoint(this.#xfm, to);
            if (ctx) {
                ctx.beginPath();
                ctx.moveTo(start.x, start.y);
                ctx.lineTo(end.x, end.y);
                ctx.stroke();
                ctx.closePath();
            }
        } else if (spec.turtles) {
            // this is a turtle operation
            // Initialize a matrix for tracking turtle state
            let turtleXfm = { ...this.#xfm };
            let penDown = true;

            spec.turtles.forEach((turtleOp) => {
                if (turtleOp.op === "name" && turtleOp.name) {
                    // Store the current location with this name
                    // Get position from the current transform matrix
                    const position = currentPosition(turtleXfm);
                    // Get direction from the transform matrix (assuming unit vectors)
                    // In the standard basis, (0, -1) is "up", so we transform that vector
                    const baseDir = { dx: 0, dy: -1 };
                    const direction = transformDirection(turtleXfm, baseDir);

                    namedLocations[turtleOp.name] = {
                        position,
                        direction,
                    };
                } else if (turtleOp.op === "move") {
                    const distance = turtleOp.move;
                    const currentPos = currentPosition(turtleXfm);
                    const forwardOffset = { x: 0, y: -distance };

                    // Transform this offset to get the new position in world space
                    const newPos = transformPoint(turtleXfm, forwardOffset);

                    // Draw a line if the pen is down
                    if (ctx && penDown) {
                        ctx.beginPath();
                        ctx.moveTo(currentPos.x, currentPos.y);
                        ctx.lineTo(newPos.x, newPos.y);
                        ctx.stroke();
                        ctx.closePath();
                    }

                    // Update the transform to translate to the new position
                    const translationMat = translationMatrix({
                        dx: forwardOffset.x,
                        dy: forwardOffset.y,
                    });

                    turtleXfm = multiplyMatrices(turtleXfm, translationMat);
                } else if (turtleOp.op === "turn") {
                    let angleRadians = 0;

                    if (typeof turtleOp.turn === "number") {
                        // Assuming degrees for numeric input
                        angleRadians = degreesToRadians(turtleOp.turn);
                    } else if (turtleOp.turn) {
                        // Handle RotationSpec
                        if (turtleOp.turn.degrees !== undefined) {
                            angleRadians = degreesToRadians(
                                turtleOp.turn.degrees
                            );
                        } else if (turtleOp.turn.radians !== undefined) {
                            angleRadians = turtleOp.turn.radians;
                        }
                    }

                    // Get the current position
                    const currentPos = currentPosition(turtleXfm);

                    // Create rotation matrix
                    const rot = rotationMatrix(angleRadians);

                    // For rotation to work correctly with existing transforms, we need to:
                    // 1. Translate to origin
                    // 2. Apply rotation
                    // 3. Translate back to current position

                    // Create translation matrices
                    const toOrigin = translationMatrix({
                        dx: -currentPos.x,
                        dy: -currentPos.y,
                    });

                    const fromOrigin = translationMatrix({
                        dx: currentPos.x,
                        dy: currentPos.y,
                    });

                    // Apply the transformations in the correct order (right to left)
                    // First apply translation to origin
                    const step1 = multiplyMatrices(toOrigin, turtleXfm);

                    // Then apply rotation
                    const step2 = multiplyMatrices(rot, step1);

                    // Finally translate back
                    turtleXfm = multiplyMatrices(fromOrigin, step2);
                } else if (turtleOp.op === "penState") {
                    // Handle pen up/down state
                    penDown = turtleOp.penState === "down";
                }
                // Other turtle operations can be added here

                // console.log(
                //     `After turtle op ${turtleOp.op} the turtleXfm is now:`
                // );
                // console.log(printMatrix(turtleXfm));
            });
        }
        return namedLocations;
    }

    // image buffers
    saveImageBuffer(_name?: string): ImageBuffer {
        return {
            colorSpace: "rgb",
            data: [],
            size: { width: 0, height: 0 },
        };
    }
    findImageBuffer(_name: string): ImageBuffer | null {
        return null;
    }

    // input related
    events: EventHandlers = {};

    // camera related
    zoom(_factor: number) {}
    pan(_pan: Vec) {}
    rotate(_factor: number | RotationSpec) {}
    adjustCamera(_cameraSpec: CameraSpec) {}

    // pen related
    setPen(_pen: PenOp) {}

    // geometry related
    findNamedPoint(_name: string): Pt {
        return { x: 0, y: 0 };
    }
    getCurrentLocation(): Pt {
        return { x: 0, y: 0 };
    }

    /**
     * Draws a triangular cursor representing the turtle at its current position and direction.
     * @param turtleXfm The transformation matrix representing the turtle's state
     * @param ctx The canvas context to draw on
     */
    drawTurtleCursor(
        turtleXfm: Matrix,
        ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D
    ) {
        // Get the current position from the matrix
        const position = currentPosition(turtleXfm);

        // Get the current direction vector (facing direction)
        const direction = transformDirection(turtleXfm, { dx: 0, dy: -1 });

        // Define the size of the turtle cursor
        const size = 30;

        // Calculate perpendicular vector for the triangle's base
        const perpendicular = { dx: -direction.dy, dy: direction.dx };

        // Define the three points of the triangle
        // The tip of the triangle should point in the direction the turtle is facing
        const tip = {
            x: position.x + direction.dx * size,
            y: position.y + direction.dy * size,
        };

        // The base corners are behind the tip, perpendicular to the direction
        const baseCorner1 = {
            x:
                position.x -
                direction.dx * (size / 2) +
                perpendicular.dx * (size / 2),
            y:
                position.y -
                direction.dy * (size / 2) +
                perpendicular.dy * (size / 2),
        };

        const baseCorner2 = {
            x:
                position.x -
                direction.dx * (size / 2) -
                perpendicular.dx * (size / 2),
            y:
                position.y -
                direction.dy * (size / 2) -
                perpendicular.dy * (size / 2),
        };

        // Save the current context state
        ctx.save();

        // Set the style for the turtle cursor
        ctx.fillStyle = "rgba(255, 255, 0, 0.7)"; // Semi-transparent yellow
        ctx.strokeStyle = "black";
        ctx.lineWidth = 1;

        // Draw the triangle
        ctx.beginPath();
        ctx.moveTo(tip.x, tip.y);
        ctx.lineTo(baseCorner1.x, baseCorner1.y);
        ctx.lineTo(baseCorner2.x, baseCorner2.y);
        ctx.closePath();

        // Fill and stroke the triangle
        ctx.fill();
        ctx.stroke();

        // Restore the context state
        ctx.restore();
    }

    // rendering

    /**
     * This is the DrawingSurface method that is used to push pixels to an actual
     * canvas drawing context.
     */
    render(ctx: CanvasRenderingContext2D) {
        // this is where the actual drawing happens. it has useful info like size.
        const canvas = ctx.canvas;

        // make an offscreen buffer to draw onto that is independent of others.
        const offscreen = new OffscreenCanvas(
            canvas.width,
            canvas.height
        ).getContext("2d") as OffscreenCanvasRenderingContext2D;

        // // clear the canvas with a black background.
        // offscreen.fillStyle = "hsl(90, 50%, 50%)";
        // offscreen.fillRect(0, 0, canvas.width, canvas.height);
        // draw a box around the outside of the canvas.
        offscreen.strokeStyle = "white";
        offscreen.lineWidth = 5;
        // offscreen.strokeRect(0, 0, canvas.width, canvas.height);

        // Execute everything using this offscreen context
        for (const op of this.#drawOps) {
            // For turtle operations, draw the cursor at the final position
            if (op.turtles && op.turtles.length > 0) {
                // Initialize a matrix for tracking turtle state
                let turtleXfm = { ...this.#xfm };

                // Process all turtle operations to get the final transform
                op.turtles.forEach((turtleOp) => {
                    if (turtleOp.op === "move") {
                        const distance = turtleOp.move;
                        const forwardOffset = { x: 0, y: -distance };
                        const translationMat = translationMatrix({
                            dx: forwardOffset.x,
                            dy: forwardOffset.y,
                        });
                        turtleXfm = multiplyMatrices(turtleXfm, translationMat);
                    } else if (turtleOp.op === "turn") {
                        let angleRadians = 0;
                        if (typeof turtleOp.turn === "number") {
                            angleRadians = degreesToRadians(turtleOp.turn);
                        } else if (turtleOp.turn) {
                            if (turtleOp.turn.degrees !== undefined) {
                                angleRadians = degreesToRadians(
                                    turtleOp.turn.degrees
                                );
                            } else if (turtleOp.turn.radians !== undefined) {
                                angleRadians = turtleOp.turn.radians;
                            }
                        }
                        const currentPos = currentPosition(turtleXfm);
                        const rot = rotationMatrix(angleRadians);
                        const toOrigin = translationMatrix({
                            dx: -currentPos.x,
                            dy: -currentPos.y,
                        });
                        const fromOrigin = translationMatrix({
                            dx: currentPos.x,
                            dy: currentPos.y,
                        });
                        const step1 = multiplyMatrices(toOrigin, turtleXfm);
                        const step2 = multiplyMatrices(rot, step1);
                        turtleXfm = multiplyMatrices(fromOrigin, step2);
                    }
                    // Skip tracking penDown state since we're only interested in the final position
                });

                // Draw the turtle cursor at its final position
                this.drawTurtleCursor(turtleXfm, offscreen);
            }

            this.execute(op, offscreen);
        }

        // now draw the new pixels to the primary context.
        const bitmap = offscreen.canvas.transferToImageBitmap();
        ctx.drawImage(bitmap, 0, 0);
    }
}

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
type Matrix = {
    a: number;
    b: number;
    c: number;
    d: number;
    e: number;
    f: number;
};

// Matrix operations.

/**
 * Creates an identity matrix.
 */
export const identityMatrix = (): Matrix => {
    return {
        a: 1,
        b: 0,
        c: 0,
        d: 1,
        e: 0,
        f: 0,
    };
};

/**
 * Creates a translation matrix based on a vector.
 */
export const translationMatrix = (translation: Vec): Matrix => {
    return {
        a: 1,
        c: 0,
        e: translation.dx,
        b: 0,
        d: 1,
        f: translation.dy,
    };
};

/**
 * Creates a rotation matrix based on an angle in radians.
 */
export const rotationMatrix = (angleRadians: number): Matrix => {
    const cos = Math.cos(angleRadians);
    const sin = Math.sin(angleRadians);
    return {
        a: cos,
        c: -sin,
        e: 0,
        b: sin,
        d: cos,
        f: 0,
    };
};

/**
 * Converts an angle from degrees to radians.
 */
export const degreesToRadians = (degrees: number): number => {
    return (degrees * Math.PI) / 180;
};

/**
 * Creates a rotation matrix based on an angle in degrees. This just converts
 * the argument to radians and uses `rotationMatrix`.
 */
export const rotationMatrixDegrees = (angleDegrees: number): Matrix => {
    const radians = degreesToRadians(angleDegrees);
    return rotationMatrix(radians);
};

/**
 * Creates a scaling matrix that scales in X dimension.
 */
export const scaleXMatrix = (factor: number): Matrix => {
    return {
        a: factor,
        c: 0,
        e: 0,
        b: 0,
        d: 1,
        f: 0,
    };
};

/**
 * Creates a scaling matrix that scales in Y dimension.
 */
export const scaleYMatrix = (factor: number): Matrix => {
    return {
        a: 1,
        c: 0,
        e: 0,
        b: 0,
        d: factor,
        f: 0,
    };
};

/**
 * Creates a scaling matrix that scales uniformly in both dimensions.
 */
export const scaleMatrix = (factor: number): Matrix => {
    return {
        a: factor,
        c: 0,
        e: 0,
        b: 0,
        d: factor,
        f: 0,
    };
};

/**
 * Multiplies two matrices and returns the result.
 */
export const multiplyMatrices = (m1: Matrix, m2: Matrix): Matrix => {
    return {
        a: m1.a * m2.a + m1.c * m2.b,
        b: m1.b * m2.a + m1.d * m2.b,
        c: m1.a * m2.c + m1.c * m2.d,
        d: m1.b * m2.c + m1.d * m2.d,
        e: m1.a * m2.e + m1.c * m2.f + m1.e,
        f: m1.b * m2.e + m1.d * m2.f + m1.f,
    };
};

/**
 * Calculates the determinant of a matrix.
 */
export const determinant = (m: Matrix): number => {
    return m.a * m.d - m.b * m.c;
};

/**
 * Checks if a matrix is singular (cannot be inverted).
 */
export const isSingular = (m: Matrix): boolean => {
    return Math.abs(determinant(m)) < 1e-10; // Using a small epsilon for floating point comparison.
};

/**
 * Calculates the inverse of a matrix.
 * Throws an error if the matrix is singular.
 */
export const inverseMatrix = (m: Matrix): Matrix => {
    const det = determinant(m);

    if (isSingular(m)) {
        throw new Error("Cannot invert a singular matrix");
    }

    const invDet = 1 / det;

    return {
        a: m.d * invDet,
        b: -m.b * invDet,
        c: -m.c * invDet,
        d: m.a * invDet,
        e: (m.c * m.f - m.d * m.e) * invDet,
        f: (m.b * m.e - m.a * m.f) * invDet,
    };
};

export const currentPosition = (m: Matrix): Pt => {
    // The current position is given by the translation components of the matrix.
    return {
        x: m.e,
        y: m.f,
    };
};

/**
 * Transforms a point from model space to screen space using the transformation
 * matrix.
 */
export const transformPoint = (m: Matrix, p: Pt): Pt => {
    return {
        x: m.a * p.x + m.c * p.y + m.e,
        y: m.b * p.x + m.d * p.y + m.f,
    };
};

/**
 * Transforms a vector using the transformation matrix (ignoring translation).
 */
export const transformVector = (m: Matrix, v: Vec): Vec => {
    return {
        dx: m.a * v.dx + m.c * v.dy,
        dy: m.b * v.dx + m.d * v.dy,
    };
};

/**
 * Transforms a direction vector and ensures it maintains unit length.
 */
export const transformDirection = (m: Matrix, dir: Dir): Dir => {
    const transformed = transformVector(m, dir);
    const length = Math.sqrt(
        transformed.dx * transformed.dx + transformed.dy * transformed.dy
    );

    if (length < 1e-10) {
        return { dx: 0, dy: 0 }; // Prevent division by zero.
    }

    return {
        dx: transformed.dx / length,
        dy: transformed.dy / length,
    };
};

/**
 * Transforms a point from screen space back to model space using the inverse of
 * the transformation matrix.
 */
export const inverseTransformPoint = (m: Matrix, p: Pt): Pt => {
    try {
        const inv = inverseMatrix(m);
        return transformPoint(inv, p);
    } catch (_e) {
        throw new Error("Cannot transform point with singular matrix");
    }
};

/**
 * Creates a combined transformation matrix from multiple operations.
 */
export const createTransformMatrix = (
    translation?: Vec,
    rotation?: number,
    scale?: number | { x: number; y: number }
): Matrix => {
    let matrix = identityMatrix();

    // Apply operations in order: scale, rotate, translate.
    if (scale !== undefined) {
        if (typeof scale === "number") {
            matrix = multiplyMatrices(matrix, scaleMatrix(scale));
        } else {
            matrix = multiplyMatrices(matrix, scaleXMatrix(scale.x));
            matrix = multiplyMatrices(matrix, scaleYMatrix(scale.y));
        }
    }

    if (rotation !== undefined) {
        matrix = multiplyMatrices(matrix, rotationMatrix(rotation));
    }

    if (translation !== undefined) {
        matrix = multiplyMatrices(matrix, translationMatrix(translation));
    }

    return matrix;
};

/**
 * A debugging function to print out a matrix with properly aligned decimal points.
 */
const printMatrix = (m: Matrix): string => {
    // Find the maximum number of digits needed for proper alignment
    const values = [m.a, m.b, m.c, m.d, m.e, m.f, 0]; // Include 0 for the last row

    // Get the maximum number of digits before the decimal point
    const maxBeforeDecimal = values.reduce((max, val) => {
        const digits =
            Math.abs(val) < 1 ? 1 : Math.floor(Math.log10(Math.abs(val))) + 1;
        return Math.max(max, digits);
    }, 0);

    // Format a number with proper padding to align decimal points
    const format = (n: number) => {
        const isNegative = n < 0;
        const absValue = Math.abs(n);

        // Get integer and decimal parts
        const integerPart = Math.floor(absValue).toString();
        const decimalPart = absValue.toFixed(2).split(".")[1];

        // Calculate padding for proper alignment
        const padding = " ".repeat(maxBeforeDecimal - integerPart.length);

        // Combine with sign, padding, and proper spacing
        return `${isNegative ? "-" : " "}${padding}${integerPart}.${decimalPart}`;
    };

    return `[
    ${format(m.a)} ${format(m.c)} ${format(m.e)}
    ${format(m.b)} ${format(m.d)} ${format(m.f)}
    ${format(0)} ${format(0)} ${format(1)}
  ]`;
};
