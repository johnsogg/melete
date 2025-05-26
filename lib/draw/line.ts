import { transformPoint } from "../matrix";
import type { LineOp, RenderSupport } from "../types";

export const drawLine = ({
    surf,
    ctx,
    geom: { from, to },
}: RenderSupport<LineOp>) => {
    const start = transformPoint(surf.xfm, from);
    const end = transformPoint(surf.xfm, to);
    if (ctx) {
        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.stroke();
        ctx.closePath();
    }
};
