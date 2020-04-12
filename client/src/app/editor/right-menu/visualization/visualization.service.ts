

import { Injectable } from '@angular/core';
import { EditorService } from 'src/app/shared/services/Editor/editor.service';
import { BackgroundCanvas } from 'src/app/shared/services/Editor/Tools/background-canvas.service';
import { CanvasDimensionService } from '../../../shared/services/Editor/canvas-dimension.service';

const BRIGHTNESS_FACTOR = 33.0;
const CONTRAST_FACTOR = 50.0;

@Injectable({
  providedIn: 'root'
})
export class VisualizationService {
    constructor(public editorService: EditorService, public canvasDimensionService:CanvasDimensionService) {}

    applyChanges(canvas: BackgroundCanvas, brightness: number, contrast: number, autoContrast= false): void {
        const image = canvas.getOriginalImageData();
        const data = image.data;
        if (autoContrast) {
            this.applyAutoContrast(data);
        } else {
            this.applyBrightness(data, Math.pow(brightness / BRIGHTNESS_FACTOR, 3));
            this.applyContrast(data, Math.pow(contrast / CONTRAST_FACTOR, 3));
        }
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

    applyAutoContrast(data: Uint8ClampedArray): void {
        let max_r = 0.0;
        let max_g = 0.0;
        let max_b = 0.0;

        for (let i = 0; i < data.length; i += 4) {
            max_r = Math.max(data[i], max_r);
            max_g = Math.max(data[i + 1], max_g);
            max_b = Math.max(data[i + 2], max_b);
        }
        const r_factor = 255.0 / max_r;
        const g_factor = 255.0 / max_g;
        const b_factor = 255.0 / max_b;

        for (let i = 0; i < data.length; i += 4) {
            data[i] = data[i] * r_factor;
            data[i + 1] = data[i + 1] * g_factor;
            data[i + 2] = data[i + 2] * b_factor;
        }
    }

    tooglePretreatments(showPretreatments: boolean): void {
        this.canvasDimensionService.backgroundCanvas.tooglePretreatments(showPretreatments);
    }
}
