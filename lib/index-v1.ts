// TODO(gabe): rm bogus code
export const multiply = (a: number, b: number): number => {
  return a * b;
};

const _getCanvas = (canvasId: string) => {
  const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
  return canvas;
};

export interface Pt {
  x: number;
  y: number;
}

export interface LineSegment {
  start: Pt;
  end: Pt;
}

export interface MeleteOptions {
  canvasId?: string;
  canvasParentSelector?: string;
  initialWidth?: number;
  initialHeight?: number;
  style?: string;
  resizePolicy: "fullScreen" | "static" | ResizeFunction;
}

type ResizeFunction = (canvas: HTMLCanvasElement) => void;

export const fullScreen = (canvas: HTMLCanvasElement) => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
};

export const canvasOffset = (canvas: HTMLCanvasElement) => {
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;
};

/**
 * Initialize an instance of melete that has a canvas.
 */
export const initMelete = ({
  canvasId = "melete",
  canvasParentSelector = "#app",
  initialHeight: height = undefined,
  initialWidth: width = undefined,
  style = undefined,
  resizePolicy = "fullScreen",
}: MeleteOptions) => {
  document.querySelector<HTMLDivElement>(`${canvasParentSelector}`)!.innerHTML =
    `
    <canvas 
      id="${canvasId}" 
      width="${width}" 
      height="${height}" 
      ${style ? `style="${style}"` : ""}
      tabindex="0"></canvas>
  `;

  const resize = () => {
    const canvas = _getCanvas(canvasId);
    if (!canvas) return;
    switch (resizePolicy) {
      case "fullScreen":
        fullScreen(canvas);
        break;
      case "static":
        canvasOffset(canvas);
        break;
      default:
        resizePolicy(canvas);
    }
    drawCanvas();
  };

  window.addEventListener("load", resize);
  window.addEventListener("resize", resize);

  // NOTE: this is not how it should really be done. This is only to show
  // drawing the different melete instances and to prove to myself that it
  // works. I'd like to use a rendering stack with pen settings instead of a
  // simple geometry list.
  const geometry: Array<LineSegment> = [];

  const drawCanvas = () => {
    const canvas = _getCanvas(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.fillStyle = "black";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = "white";
      ctx.lineWidth = 5;
      // draw a box around the outside of the canvas
      ctx.strokeRect(0, 0, canvas.width, canvas.height);

      for (const seg of geometry) {
        // draw a line on ctx from seg.start to seg.end
        ctx.beginPath();
        ctx.moveTo(seg.start.x, seg.start.y);
        ctx.lineTo(seg.end.x, seg.end.y);
        ctx.stroke();
        ctx.closePath();
      }
    }
  };

  const animate = (frameRate: number) => {
    // check for a reasonable frame rate
    if (frameRate < 1 || frameRate > 60) {
      console.error("Frame rate must be between 1 and 60");
      return;
    }
    // invoke drawCanvas at the given frame rate
    const interval = 1000 / frameRate;
    setInterval(() => {
      drawCanvas();
    }, interval);
  };

  const addBuffer = () => {};

  return {
    addBuffer,
    animate,
    drawCanvas,
    geometry,
  };
};
