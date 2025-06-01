/* eslint-disable no-console */

/** This function directly uses console.log to print things. */
export const debugImageCache = (cache: Map<string, ImageData>) => {
    console.log("Image Cache Debug Info:");
    let totalMemoryUsage = 0;
    cache.forEach((imageData, name) => {
        const { width, height } = imageData;
        const memoryUsage = width * height * 4; // RGBA uses 4 bytes per pixel
        totalMemoryUsage += memoryUsage;
        console.log(
            `  Name: ${name}, Size: ${width}x${height}, Memory Usage: ${memoryUsage} bytes`
        );
    });
    console.log(
        `Total Images in Cache: ${cache.size} (${totalMemoryUsage} bytes total)`
    );
};
