import { drawLine } from "./draw/line";
import { drawTurtleCursor, drawTurtles } from "./draw/turtles"; // Added drawTurtleCursor import
import {
    currentPosition,
    degreesToRadians,
    identityMatrix,
    multiplyMatrices,
    rotationMatrix,
    translationMatrix,
} from "./matrix";
import {
    DrawOp,
    ImageBuffer,
    Matrix,
    NamedLocation,
    PenOp,
    Pt,
    RenderContext,
    TurtleOp,
} from "./types";

/**
 * The DrawingSurface class represents a drawing area that can contain various drawing operations.
 */
export class DrawingSurface {
    // drawing data
    #drawOps: Array<DrawOp> = [];
    #xfm: Matrix = identityMatrix();
    #pens: Array<PenOp> = [];

    public constructor(public readonly name: string) {}

    get xfm(): Readonly<Matrix> {
        return { ...this.#xfm };
    }

    /**
     * Adds a drawing operation to this surface and executes it.
     */
    draw(spec: DrawOp): Record<string, NamedLocation> {
        this.#drawOps.push(spec);
        return this.execute(spec);
    }

    /**
     * Executes a drawing operation on the given context.
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

    // camera operations - Keep this as I plan on implementing it.
    // zoom(_factor: number) {}
    // pan(_pan: Vec) {}
    // rotate(_factor: number | RotationSpec) {}
    // adjustCamera(_cameraSpec: CameraSpec) {}

    setPen(pen: PenOp) {
        if (this.#pens.length) {
            const combined = { ...this.#pens.at(-1), pen };
            this.#pens.push(combined);
        } else {
            this.#pens.push(pen);
        }
    }

    popPen() {
        if (this.#pens.length) {
            this.#pens.pop();
        } else {
            console.warn("Warning: popping from empty pen stack");
        }
    }

    findNamedPoint(_name: string): Pt {
        return { x: 0, y: 0 };
    }

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
                drawTurtleCursor(turtleXfm, offscreen); // Updated call
            }

            this.execute(op, offscreen);
        }

        // now draw the new pixels to the primary context.
        const bitmap = offscreen.canvas.transferToImageBitmap();
        ctx.drawImage(bitmap, 0, 0);
    }
}
