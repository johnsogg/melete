import { DrawingSurface } from "./drawingSurface";
import { RollingStatistics } from "./tools/rollingStatistics";
import {
    AllEventHandlers,
    MouseEventHandler,
    ResizeFunction,
    ResizePolicy,
    ResizePolicyMap,
    Size,
} from "./types";

const _getCanvas = (canvasId: string) => {
    const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    return canvas;
};

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
    #eventListenersAttached: boolean = false; // Added flag

    #frameStats: RollingStatistics = new RollingStatistics(60);

    #eventHandlers: AllEventHandlers = {
        mouseClick: [],
    };

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
            tabindex="0"></canvas>`;

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

        const canvas = _getCanvas(this.canvasId);
        if (!canvas) {
            console.error("Unable to find canvas in constructor");
            return;
        }

        canvas.addEventListener("click", (event: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            const meleteEvent = {
                altKey: event.altKey,
                ctrlKey: event.ctrlKey,
                metaKey: event.metaKey,
                shiftKey: event.shiftKey,
                x: event.clientX - rect.left,
                y: event.clientY - rect.top,
                dx: event.movementX,
                dy: event.movementY,
                time: event.timeStamp,
                button: event.button,
            };
            this.#eventHandlers.mouseClick.forEach((handler) => {
                handler(meleteEvent);
            });
        });
    }

    get tick() {
        return this.#tick;
    }

    get previousTick() {
        return this.#previousTick;
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

    createLayer(name: string, animated: boolean = false): DrawingSurface {
        const existing = this.surfaces.find((s) => s.name === name);
        if (existing) {
            console.warn(`Creating another layer named "${name}"`);
        }
        const surf = new DrawingSurface(name, animated);
        this.surfaces.push(surf);
        return surf;
    }

    draw() {
        const startTime = performance.now();
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
        const endTime = performance.now();
        const duration = endTime - startTime;
        if (this.#frameStats != null) {
            this.#frameStats.addValue(duration);
        }
    }

    animate() {
        setInterval(() => this.draw(), 33);
    }

    addMouseClickHandler(handler: MouseEventHandler) {
        this.#eventHandlers.mouseClick.push(handler);
    }
}
