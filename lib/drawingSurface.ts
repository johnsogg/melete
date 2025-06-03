import { drawImage } from "./draw/image";
import { drawLine } from "./draw/line";
import { drawSaveImage } from "./draw/saveImage";
import { drawTurtles } from "./draw/turtles"; // Added drawTurtleCursor import
import { identityMatrix } from "./matrix";
import {
    DrawFn,
    DrawOp,
    Matrix,
    NamedLocation,
    PenOp,
    Pt,
    RenderContext,
    Size,
} from "./types";

/**
 * The DrawingSurface class represents a drawing area that can contain various drawing operations.
 */
export class DrawingSurface {
    // drawing data
    #drawOps: Array<DrawOp | DrawFn> = [];
    #xfm: Matrix = identityMatrix();
    #namedLocations: Record<string, NamedLocation> = {};
    #namedImages: Map<string, ImageData> = new Map();

    public constructor(public readonly name: string) {}

    get xfm(): Readonly<Matrix> {
        return { ...this.#xfm };
    }

    get namedLocations(): Readonly<Record<string, NamedLocation>> {
        return this.#namedLocations;
    }

    setPen(penOp: PenOp): void {
        this.#drawOps.push({ pen: penOp });
    }

    cacheImageBuffer(name: string, imageBuffer: ImageData) {
        this.#namedImages.set(name, imageBuffer);
    }

    async draw(spec: DrawOp | DrawFn): Promise<Record<string, NamedLocation>> {
        this.#drawOps.push(spec);
        return await this.execute(spec); // why is this needed here? seems nothing will run anyway with a null ctx
    }

    private async execute(
        opOrFunction: DrawOp | DrawFn,
        tick?: number,
        ctx?: RenderContext
    ): Promise<Record<string, NamedLocation>> {
        const namedLocations = this.#namedLocations;
        let spec: DrawOp;
        if (typeof opOrFunction === "function") {
            spec = opOrFunction(tick ?? 0);
        } else {
            spec = opOrFunction;
        }
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
            drawLine({ surf: this, ctx, geom: spec.line });
        } else if (ctx && spec.turtles) {
            drawTurtles({
                surf: this,
                ctx,
                geom: spec.turtles,
            });
        } else if (ctx && spec.saveImage) {
            drawSaveImage({
                ctx,
                geom: spec.saveImage,
                surf: this,
            });
        } else if (ctx && spec.image) {
            await drawImage({
                ctx,
                geom: spec.image,
                surf: this,
            });
        } else if (ctx) {
            console.warn(
                "Drawing surface can't yet process instruction:\n",
                JSON.stringify(spec, null, 4)
            );
        }

        return namedLocations;
    }

    saveImageBuffer({
        name,
        topLeft,
        size,
    }: {
        name: string;
        topLeft: Pt;
        size: Size;
    }) {
        this.#drawOps.push({
            saveImage: {
                name,
                size,
                topLeft,
            },
        });
    }

    findImageBuffer(name: string): ImageData | undefined {
        return this.#namedImages.get(name);
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
    async render(ctx: CanvasRenderingContext2D, tick: number) {
        const canvas = ctx.canvas;

        // make an offscreen buffer to draw onto that is independent of others.
        const offscreen = new OffscreenCanvas(
            canvas.width,
            canvas.height
        ).getContext("2d") as OffscreenCanvasRenderingContext2D;

        // draw a box around the outside of the canvas.
        offscreen.strokeStyle = "white";
        offscreen.lineWidth = 5;
        offscreen.strokeRect(
            0,
            0,
            offscreen.canvas.width,
            offscreen.canvas.height
        );

        // Execute everything using this offscreen context
        for (const op of this.#drawOps) {
            await this.execute(op, tick, offscreen);
        }

        // now draw the new pixels to the primary context.
        const bitmap = offscreen.canvas.transferToImageBitmap();
        ctx.drawImage(bitmap, 0, 0);
        bitmap.close();
    }
}
