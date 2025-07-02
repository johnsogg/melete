import { CanvasOptions, Color, Font } from './types';

export class Canvas {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  constructor(canvas: HTMLCanvasElement, options: CanvasOptions) {
    this.canvas = canvas;
    this.canvas.width = options.width;
    this.canvas.height = options.height;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Could not get 2D rendering context');
    }
    this.ctx = ctx;
  }

  clear(color?: Color): void {
    if (color) {
      this.ctx.fillStyle = color;
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    } else {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }

  setFillColor(color: Color): void {
    this.ctx.fillStyle = color;
  }

  setStrokeColor(color: Color): void {
    this.ctx.strokeStyle = color;
  }

  setFont(font: Font): void {
    this.ctx.font = font;
  }

  fillRect(x: number, y: number, width: number, height: number): void {
    this.ctx.fillRect(x, y, width, height);
  }

  strokeRect(x: number, y: number, width: number, height: number): void {
    this.ctx.strokeRect(x, y, width, height);
  }

  fillCircle(x: number, y: number, radius: number): void {
    this.ctx.beginPath();
    this.ctx.arc(x, y, radius, 0, 2 * Math.PI);
    this.ctx.fill();
  }

  strokeCircle(x: number, y: number, radius: number): void {
    this.ctx.beginPath();
    this.ctx.arc(x, y, radius, 0, 2 * Math.PI);
    this.ctx.stroke();
  }

  fillText(text: string, x: number, y: number): void {
    this.ctx.fillText(text, x, y);
  }

  strokeText(text: string, x: number, y: number): void {
    this.ctx.strokeText(text, x, y);
  }

  getWidth(): number {
    return this.canvas.width;
  }

  getHeight(): number {
    return this.canvas.height;
  }

  getContext(): CanvasRenderingContext2D {
    return this.ctx;
  }

  getElement(): HTMLCanvasElement {
    return this.canvas;
  }
}

export function createCanvas(
  canvasElement: HTMLCanvasElement,
  options: CanvasOptions
): Canvas {
  return new Canvas(canvasElement, options);
}
