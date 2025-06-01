import { ImageBufferOp, RenderSupport } from "~/types";

export const drawImage = async ({
    ctx,
    surf,
    geom: { name, topLeft, size },
}: RenderSupport<ImageBufferOp>) => {
    if (!ctx) {
        return;
    }
    const imageData = surf.findImageBuffer(name);
    if (!imageData) {
        throw new Error(`Buffer '${name}' not found`);
    }

    const imageBitmap = await createImageBitmap(imageData);
    const renderedSize = {
        width: size?.width ?? imageBitmap.width,
        height: size?.height ?? imageBitmap.height,
    };

    ctx.drawImage(
        imageBitmap,
        topLeft.x,
        topLeft.y,
        renderedSize.width,
        renderedSize.height
    );
    imageBitmap.close();
};
