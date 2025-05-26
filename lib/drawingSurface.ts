import { drawLine } from "./draw/line";
import { drawTurtles } from "./draw/turtles";
import {
    currentPosition,
    identityMatrix,
    multiplyMatrices,
    transformDirection,
    transformPoint,
    translationMatrix,
    degreesToRadians,
    rotationMatrix,
} from "./matrix";
import {
    DrawOp,
    EventHandlers,
    ImageBuffer,
    Matrix,
    NamedLocation,
    PenOp,
    Pt,
    RenderContext,
    RotationSpec,
    TurtleOp,
    Vec,
} from "./types";

/**
 * The DrawingSurface class represents a drawing area that can contain various drawing operations.
 */
export class DrawingSurface {
    // drawing data
    #drawOps: Array<DrawOp> = [];
    #xfm: Matrix = identityMatrix();

    /**
     * Creates a new drawing surface with the given name.
     * @param name The name of the drawing surface.
     */
    public constructor(public readonly name: string) {}

    get xfm(): Readonly<Matrix> {
        return { ...this.#xfm };
    }

    /**
     * Adds a drawing operation to this surface and executes it.
     * @param spec The drawing operation specification.
     * @returns A record of named locations created during execution.
     */
    draw(spec: DrawOp): Record<string, NamedLocation> {
        this.#drawOps.push(spec);
        return this.execute(spec);
    }

    /**
     * Redraws the surface.
     */
    redraw() {}

    /**
     * Plans a drawing operation without recording or executing it.
     * @param _spec The drawing operation specification.
     * @returns An empty record of named locations.
     */
    plan(_spec: DrawOp): Record<string, NamedLocation> {
        return {};
    }

    /**
     * Executes a drawing operation on the given context.
     * @param spec The drawing operation specification.
     * @param ctx Optional canvas context to draw on.
     * @returns A record of named locations created during execution.
     */
    private execute(
        spec: DrawOp,
        ctx?: RenderContext
    ): Record<string, NamedLocation> {
        const namedLocations: Record<string, NamedLocation> = {};

        // this is a draw op, so we need to run it.
        if (ctx && spec.line) {
            drawLine({ surf: this, ctx, namedLocations, geom: spec.line });
        } else if (ctx && spec.turtles) {
            drawTurtles({
                surf: this,
                ctx,
                namedLocations,
                geom: spec.turtles,
            });
            // TODO: need to add namedLocations to the RenderSupport type and pass it in
        }
        return namedLocations;
    }

    /**
     * Saves the current image buffer.
     * @param _name Optional name for the saved buffer.
     * @returns An empty image buffer.
     */
    saveImageBuffer(_name?: string): ImageBuffer {
        return {
            colorSpace: "rgb",
            data: [],
            size: { width: 0, height: 0 },
        };
    }

    /**
     * Finds an image buffer by name.
     * @param _name The name of the image buffer to find.
     * @returns Null, as this is not yet implemented.
     */
    findImageBuffer(_name: string): ImageBuffer | null {
        return null;
    }

    /**
     * Event handlers for this drawing surface.
     */
    events: EventHandlers = {};

    /**
     * Adjusts the zoom factor of the camera.
     * @param _factor The zoom factor.
     */
    zoom(_factor: number) {}

    /**
     * Pans the camera.
     * @param _pan The panning vector.
     */
    pan(_pan: Vec) {}

    /**
     * Rotates the camera.
     * @param _factor The rotation factor or specification.
     */
    rotate(_factor: number | RotationSpec) {}

    /**
     * Adjusts the camera according to the given specification.
     * @param _cameraSpec The camera specification.
     */
    adjustCamera(_cameraSpec: any) {}

    /**
     * Sets the pen properties.
     * @param _pen The pen properties.
     */
    setPen(_pen: PenOp) {}

    /**
     * Finds a named point.
     * @param _name The name of the point to find.
     * @returns A default point at (0, 0).
     */
    findNamedPoint(_name: string): Pt {
        return { x: 0, y: 0 };
    }

    /**
     * Gets the current location.
     * @returns A default point at (0, 0).
     */
    getCurrentLocation(): Pt {
        return { x: 0, y: 0 };
    }

    /**
     * Draws a triangular cursor representing the turtle at its current position and direction.
     * @param turtleXfm The transformation matrix representing the turtle's state
     * @param ctx The canvas context to draw on
     */
    drawTurtleCursor(turtleXfm: Matrix, ctx: RenderContext) {
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

    /**
     * This is the DrawingSurface method that is used to push pixels to an actual
     * canvas drawing context.
     * @param ctx The canvas rendering context to draw on.
     */
    render(ctx: CanvasRenderingContext2D) {
        // this is where the actual drawing happens. it has useful info like size.
        const canvas = ctx.canvas;

        // make an offscreen buffer to draw onto that is independent of others.
        const offscreen = new OffscreenCanvas(
            canvas.width,
            canvas.height
        ).getContext("2d") as OffscreenCanvasRenderingContext2D;

        // draw a box around the outside of the canvas.
        offscreen.strokeStyle = "white";
        offscreen.lineWidth = 5;

        // Execute everything using this offscreen context
        for (const op of this.#drawOps) {
            // For turtle operations, draw the cursor at the final position
            if (op.turtles && op.turtles.length > 0) {
                // Initialize a matrix for tracking turtle state
                let turtleXfm = { ...this.#xfm };

                // Process all turtle operations to get the final transform
                op.turtles.forEach((turtleOp: TurtleOp) => {
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
