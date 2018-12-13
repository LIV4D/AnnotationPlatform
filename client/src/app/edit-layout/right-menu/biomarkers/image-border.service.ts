import { AppService } from './../../../app.service';
import { EditorService } from './../../editor/editor.service';
import { LayersService } from './../../editor/layers/layers.service';
import { Injectable } from '@angular/core';

// Possible optimization: Combine all layers into one and only calculate edges once.
// Drawbacks: hiding layers will require recombining all layers into one.
@Injectable()
export class ImageBorderService {
    kernel: number[];
    thickness: number;
    showBorders: boolean;
    constructor(private layersService: LayersService, public editorService: EditorService, public appService: AppService) {
        this.thickness = 1;
        this.kernel = this.createKernel(this.thickness);
        this.showBorders = false;
    }

    toggleBorders(showBorders: boolean): void {
        this.appService.loading = true;
        this.layersService.biomarkerCanvas.forEach((b) => {
            b.drawBorders = showBorders;
            if (showBorders) {
                const canvas = b.currentCanvas;
                const context = b.currentCanvas.getContext('2d');
                const imageData = context.createImageData(canvas.width, canvas.height);
                const imageDataOrig = context.getImageData(0, 0, canvas.width, canvas.height);
                this.erode(imageData, imageDataOrig, canvas);
                b.borderCanvas.getContext('2d').putImageData(imageData, 0, 0);
            }
        });
        this.editorService.transform();
        this.appService.loading = false;
    }

    erode(image: ImageData, imageOrig: ImageData, canvas: HTMLCanvasElement): void {
        const data = image.data;
        const dataOrig = imageOrig.data;

        for (let x = 0; x < (canvas.width << 2); x += 4) {
            for (let y = 0; y < canvas.height; y++) {
                const r = x + y * (canvas.width << 2);
                const g = r + 1;
                const b = g + 1;
                const a = b + 1;
                // keep border pixels
                if (x === 0 || y === 0 || x === ((canvas.width - 1) << 2) || y === canvas.height - 1) {
                    if (dataOrig[a] > 120) {
                        data[r] = dataOrig[r];
                        data[g] = dataOrig[g];
                        data[b] = dataOrig[b];
                        data[a] = dataOrig[a];
                    }
                } else {
                    if (dataOrig[a] > 120) {
                        this.pixelInsideKernel(x, y, data, dataOrig, canvas);
                    }
                }
            }
        }
    }

    pixelInsideKernel(x: number, y: number, data: Uint8ClampedArray, dataOrig: Uint8ClampedArray,
        canvas: HTMLCanvasElement): void {
        for (let i = 0; i < this.kernel.length; i++) {
            if (this.kernel[i] === 1) {
                const compX = (x + 4 * (Math.floor(i / 3) - Math.floor((this.kernel.length / 3) >> 1)));
                const compY = (y - Math.floor((this.kernel.length / 3) >> 1) + i % 3) * (canvas.width << 2);
                const r = x + y * (canvas.width << 2);
                const g = r + 1;
                const b = g + 1;
                const a = b + 1;
                if (dataOrig[compX + compY + 3] < 120) {
                    data[r] = dataOrig[r];
                    data[g] = dataOrig[g];
                    data[b] = dataOrig[b];
                    data[a] = dataOrig[a];
                    break;
                }
            }
        }
    }

    createKernel(thickness: number): number[] {
        if (thickness % 2 === 0) { thickness++; }
        const res = [];
        for (let i = 0; i < thickness + 2; i++) {
            const row = [];
            for (let j = 0; j < thickness + 2; j++) {
                if (j > Math.floor((thickness + 2) / 2) - i || j < Math.floor((thickness + 2) / 2) + i) {
                    row.push(1);
                } else {
                    row.push(0);
                }
            }
            res.push(row);
        }
        // return result as 1D array for faster looping later
        const list = [];
        for (let i = 0; i < res.length; i++) {
            for (let j = 0; j < res[i].length; j++) {
                list.push(res[i][j]);
            }
        }
        return list;
    }
}
