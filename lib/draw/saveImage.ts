import { RenderSupport, SaveImageBufferOp } from "~/types";

export const drawSaveImage = ({
    geom: { name, size, topLeft },
    surf,
    ctx,
}: RenderSupport<SaveImageBufferOp>) => {
    if (ctx) {
        const imageData = ctx.getImageData(
            topLeft.x,
            topLeft.y,
            size.width,
            size.height
        );
        surf.cacheImageBuffer(name, imageData);
    }
};
