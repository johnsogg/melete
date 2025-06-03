import { DrawingSurface } from "./drawingSurface";
import { ResizeFunction, ResizePolicy, ResizePolicyMap, Size } from "./types";

/**
 * Gets a canvas element by its ID.
 * @param canvasId The ID of the canvas element.
 * @returns The canvas element.
 */
const _getCanvas = (canvasId: string) => {
    const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    return canvas;
};

/**
 * Resize function that sets the canvas size to the full window dimensions.
 * @param canvas The canvas element to resize.
 * @returns The new size of the canvas.
 */
const _resizeFullScreen: ResizeFunction = (canvas: HTMLCanvasElement) => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    return {
        width: canvas.width,
        height: canvas.height,
    };
};

/**
 * Resize function that sets the canvas size to match its offset dimensions.
 * @param canvas The canvas element to resize.
 * @returns The new size of the canvas.
 */
const _resizeCanvasOffset: ResizeFunction = (canvas: HTMLCanvasElement) => {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    return {
        width: canvas.width,
        height: canvas.height,
    };
};

/**
 * Map of resize policy names to resize functions.
 */
const _resizePolicies: ResizePolicyMap = {
    fullscreen: _resizeFullScreen,
    static: _resizeCanvasOffset,
};

/**
 * The main Melete class that manages a canvas and drawing surfaces.
 * @template T The type of the user model.
 */
export class Melete<T = void> {
    private surfaces: DrawingSurface[];
    public readonly canvasId: string;
    public canvasSize: Size;
    public userModel?: T;

    #tick: number = 0;
    #previousTick: number = 0;

    /**
     * Creates a new Melete instance.
     * @param options The options for creating the Melete instance.
     */
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

    /**
     * Gets the current tick value.
     */
    get tick() {
        return this.#tick;
    }

    /**
     * Gets the previous tick value.
     */
    get previousTick() {
        return this.#previousTick;
    }

    /**
     * Gets the canvas element.
     * @returns The canvas element.
     * @throws An error if the canvas element is not found.
     */
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

    /**
     * Gets the default drawing layer.
     * @returns The default drawing surface.
     */
    getDefaultLayer(): DrawingSurface {
        let def = this.surfaces.find((s) => s.name === "default");
        if (!def) {
            def = new DrawingSurface("default");
            this.surfaces.push(def);
        }
        return def;
    }

    /**
     * Creates a new drawing layer with the given name.
     * @param name The name of the new layer.
     * @returns The new drawing surface.
     */
    createLayer(name: string): DrawingSurface {
        const existing = this.surfaces.find((s) => s.name === name);
        if (existing) {
            console.warn(`Creating another layer named "${name}"`);
        }
        const surf = new DrawingSurface(name);
        this.surfaces.push(surf);
        return surf;
    }

    /**
     * Draws all surfaces to the canvas.
     */
    draw() {
        // draw all surfaces in the order they appear in the array
        const canvas = this.getCanvas();
        const ctx = canvas.getContext("2d");
        if (!ctx) {
            throw new Error("Failed to get canvas context");
        }
        this.#tick++;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        this.surfaces.forEach((surf) => {
            surf.render(ctx, this.#tick);
        });
    }

    animate() {
        setInterval(() => this.draw(), 1000);
    }
}
