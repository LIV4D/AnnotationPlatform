import { Injectable } from '@angular/core';

// Possible optimization: Combine all layers into one and only calculate edges once.
// Drawbacks: hiding layers will require recombining all layers into one.
@Injectable()
export class ImageBorderService {
    thickness: number;
    showBorders: boolean;
    constructor() {
        this.thickness = 1;
        this.showBorders = false;
    }


    erode(canvasDst: HTMLCanvasElement, canvasSrc: HTMLCanvasElement, minX = 0, minY = 0, maxX?: number, maxY?: number): void {
        if (!maxX) {
            maxX = canvasSrc.width;
        }
        if (!maxY) {
            maxY = canvasSrc.height;
        }

        minX = Math.floor(minX);
        minY = Math.floor(minY);
        maxX = Math.ceil(maxX);
        maxY = Math.ceil(maxY);

        const w = maxX - minX;
        const h = maxY - minY;

        const imgSrc = canvasSrc.getContext('2d').getImageData(0, 0, canvasSrc.width, canvasSrc.height);
        const dataSrc = imgSrc.data;

        const context = canvasDst.getContext('2d');
        const imgDst = context.createImageData(w, h);
        const dataDst = imgDst.data;

        const dstStride = w * 4;
        const srcStride = imgSrc.width * 4;
        const srcOffset = minY * srcStride + minX * 4;

        for (let x = 0; x < w; x++) {
            for (let y = 0; y < h; y++) {
                const idDst = y * dstStride + x * 4;
                const idSrc = y * srcStride + x * 4 + srcOffset;
                // keep border pixels
                if (x + minX === 0 || y + minY === 0 || x + minX === (imgSrc.width - 1) || y + minY === imgSrc.height - 1) {
                    if (dataSrc[idSrc + 3] > 120) {
                        dataDst[idDst] = dataSrc[idSrc];
                        dataDst[idDst + 1] = dataSrc[idSrc + 1];
                        dataDst[idDst + 2] = dataSrc[idSrc + 2];
                        dataDst[idDst + 3] = dataSrc[idSrc + 3];
                    }
                } else {
                    if (dataSrc[idSrc + 3] > 120) {
                        this.pixelInsideKernel(x, y, dataDst, dataSrc, dstStride, srcStride, srcOffset);
                    }
                }
            }
        }
        context.putImageData(imgDst, minX, minY);

    }

    pixelInsideKernel(x: number, y: number, data: Uint8ClampedArray, dataSrc: Uint8ClampedArray,
                      dstStride: number, srcStride: number, srcOffset: number): void {
        const idDst = y * dstStride + x * 4;
        const idSrc = y * srcStride + x * 4 + srcOffset;

        const aX0 = dataSrc[idSrc - srcStride + 3] > 120;   // (x, y-1)
        const aX1 = dataSrc[idSrc + srcStride + 3] > 120;   // (x, y+1)
        const aY0 = dataSrc[idSrc - 1] > 120;               // (x-1, y)
        const aY1 = dataSrc[idSrc + 7] > 120;               // (x+1, y)

        if (aX0 !== aX1 || aY0 !== aY1) {
            data[idDst] = dataSrc[idSrc];
            data[idDst + 1] = dataSrc[idSrc + 1];
            data[idDst + 2] = dataSrc[idSrc + 2];
            data[idDst + 3] = 255;
        }
    }
}
