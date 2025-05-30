import { drawLine } from "./draw/line";
import { drawTurtles } from "./draw/turtles"; // Added drawTurtleCursor import
import { identityMatrix } from "./matrix";
import {
    DrawOp,
    ImageBuffer,
    Matrix,
    NamedLocation,
    PenOp,
    Pt,
    RenderContext,
} from "./types";

/**
 * The DrawingSurface class represents a drawing area that can contain various drawing operations.
 */
export class DrawingSurface {
    // drawing data
    #drawOps: Array<DrawOp> = [];
    #xfm: Matrix = identityMatrix();
    #namedLocations: Record<string, NamedLocation> = {};
    // #pens: Array<PenOp> = [];

    public constructor(public readonly name: string) {}

    get xfm(): Readonly<Matrix> {
        return { ...this.#xfm };
    }

    setPen(penOp: PenOp): void {
        this.#drawOps.push({ pen: penOp });
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
        // const namedLocations: Record<string, NamedLocation> = {};
        const namedLocations = this.#namedLocations;
        if (ctx && spec.pen) {
            if (spec.pen.stroke != null) {
                ctx.strokeStyle = spec.pen.stroke;
            }
            if (spec.pen.thickness != null) {
                ctx.lineWidth = spec.pen.thickness;
            }
            if (spec.pen.fill != null) {
                ctx.fillStyle = spec.pen.fill || "transparent";
            }
        } else if (ctx && spec.line) {
            drawLine({ surf: this, ctx, namedLocations, geom: spec.line });
        } else if (ctx && spec.turtles) {
            drawTurtles({
                surf: this,
                ctx,
                namedLocations,
                geom: spec.turtles,
            });
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

    findNamedPoint(_name: string): Pt {
        return { x: 0, y: 0 };
    }

    /**
     * This is the DrawingSurface method that is used to push pixels to an actual
     * canvas drawing context.
     */
    render(ctx: CanvasRenderingContext2D) {
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
            this.execute(op, offscreen);
        }

        // now draw the new pixels to the primary context.
        const bitmap = offscreen.canvas.transferToImageBitmap();
        ctx.drawImage(bitmap, 0, 0);
    }
}
