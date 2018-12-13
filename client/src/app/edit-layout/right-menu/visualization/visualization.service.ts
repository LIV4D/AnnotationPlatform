import { EditorService } from './../../editor/editor.service';
import { BackgroundCanvas } from './../../../model/background-canvas';
import { Injectable } from '@angular/core';

const BRIGHTNESS_FACTOR = 33.0;
const CONTRAST_FACTOR = 50.0;
@Injectable()
export class VisualizationService {
    constructor(public editorService: EditorService) {}

    applyChanges(canvas: BackgroundCanvas, brightness: number, contrast: number): void {
        const image = canvas.getOriginalImageData();
        const data = image.data;
        this.applyBrightness(data, Math.pow(brightness / BRIGHTNESS_FACTOR, 3));
        this.applyContrast(data, Math.pow(contrast / CONTRAST_FACTOR, 3));
        canvas.currentCanvas.getContext('2d').putImageData(image, 0, 0);
        this.editorService.transform();
    }

    applyBrightness(data: Uint8ClampedArray, brightness: number): void {
        for (let i = 0; i < data.length; i += 4) {
            data[i] += 255 * (brightness / 100);
            data[i + 1] += 255 * (brightness / 100);
            data[i + 2] += 255 * (brightness / 100);
        }
    }

    applyContrast(data: Uint8ClampedArray, contrast: number): void {
        const factor = (259.0 * (contrast + 255.0)) / (255.0 * (259.0 - contrast));
        for (let i = 0; i < data.length; i += 4) {
            data[i] = (factor * (data[i] - 128.0) + 128.0);
            data[i + 1] = (factor * (data[i + 1] - 128.0) + 128.0);
            data[i + 2] = (factor * (data[i + 2] - 128.0) + 128.0);
        }
    }

    tooglePretreatments(showPretreatments: boolean): void {
        this.editorService.backgroundCanvas.tooglePretreatments(showPretreatments);
    }
}
