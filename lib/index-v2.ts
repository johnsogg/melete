import type { Melete, ResizeFunction } from "./types";

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

// Extract just the string literal types from Melete<T>["resizePolicy"]
type ResizePolicyStrings<T> = Extract<Melete<T>["resizePolicy"], string>;

// Create a type that requires all string keys with ResizeFunction values
type ResizePolicyMap<T> = Record<ResizePolicyStrings<T>, ResizeFunction>;

const _resizePolicies: ResizePolicyMap<unknown> = {
  fullScreen: _resizeFullScreen,
  static: _resizeCanvasOffset,
};

interface MeleteOptions<T> {
  canvasId?: string;
  canvasParentSelector?: string;
  initialWidth?: number;
  initialHeight?: number;
  style?: string;
  resizePolicy: Melete<T>["resizePolicy"];
  model: T;
}

const _getCanvas = (canvasId: string) => {
  const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
  return canvas;
};

const _blankMelete = <T>(
  canvasId: string,
  resizePolicy: Melete<T>["resizePolicy"],
  model: T,
): Melete<T> => {
  return {
    ...{
      canvasId,
      resizePolicy,
      tick: 0,
      lastRenderTick: 0,
      mouse: {
        position: {
          x: 0,
          y: 0,
        },
        modifiers: {
          shift: false,
          control: false,
        },
        leftState: "up",
        rightState: "up",
      },
      mouseEvents: [],
      keyboard: {
        keysEngaged: [],
      },
      keyboardEvents: [],
      canvasSize: {
        width: 0,
        height: 0,
      },
      model,
      layers: [],
    },
  };
};

export const initMelete = <T>({
  canvasId = "melete",
  canvasParentSelector = "#app",
  initialWidth = 1,
  initialHeight = 1,
  resizePolicy = "static",
  model,
}: MeleteOptions<T>): Melete<T> => {
  // make a blank Melete with default values
  const melete = _blankMelete(canvasId, resizePolicy, model);

  // dynamically create a canvas tag in the indicated parent
  document.querySelector<HTMLDivElement>(`${canvasParentSelector}`)!.innerHTML =
    `
    <canvas 
      id="${canvasId}" 
      width="${initialWidth}" 
      height="${initialHeight}" 
      tabindex="0"></canvas>
  `;

  // when the window is resized, we might need to react
  const resize = () => {
    const canvas = _getCanvas(canvasId);
    if (!canvas) return;
    // Use the handler from the map or the function itself
    const handler =
      typeof resizePolicy === "string"
        ? _resizePolicies[resizePolicy]
        : resizePolicy;

    melete.canvasSize = handler(canvas);
    drawMeleteFrame(melete);
  };

  window.addEventListener("load", resize);
  window.addEventListener("resize", resize);

  return melete;
};

export const drawMeleteFrame = <T>(melete: Melete<T>) => {
  console.log("Drawing melete: ", melete);
  const canvas = _getCanvas(melete.canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "white";
    ctx.lineWidth = 5;
    // draw a box around the outside of the canvas
    ctx.strokeRect(0, 0, canvas.width, canvas.height);

    // for (const seg of geometry) {
    //   // draw a line on ctx from seg.start to seg.end
    //   ctx.beginPath();
    //   ctx.moveTo(seg.start.x, seg.start.y);
    //   ctx.lineTo(seg.end.x, seg.end.y);
    //   ctx.stroke();
    //   ctx.closePath();
    // }
  }
};
