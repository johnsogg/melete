import { RenderContext } from "~/types";

// this draws a box around the canvas
export function drawCanvasBox(ctx: RenderContext) {
    // draw a box around the outside of the canvas. It uses black and white
    // lines to create a border so it is visible on any background.
    const ww = 15;
    const bw = 13;
    const wwh = ww / 2;
    const bwh = bw / 2;
    ctx.save();
    ctx.strokeStyle = "white";
    ctx.lineWidth = ww;
    ctx.strokeRect(wwh, wwh, ctx.canvas.width - ww, ctx.canvas.height - ww);
    ctx.strokeStyle = "black";
    ctx.lineWidth = bw;
    ctx.strokeRect(bwh, bwh, ctx.canvas.width - bw, ctx.canvas.height - bw);
    ctx.restore();
}
