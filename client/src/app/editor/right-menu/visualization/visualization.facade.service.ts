

import { Injectable } from '@angular/core';
import { BackgroundCanvas } from 'src/app/shared/services/editor/tools/background-canvas.service';
import { CanvasDimensionService } from '../../../shared/services/editor/canvas-dimension.service';
import { VisualizationService } from '../../../shared/services/editor/visualization.service';
import { AppService } from 'src/app/shared/services/app.service';

@Injectable({
  providedIn: 'root'
})
export class VisualizationFacadeService {
    constructor(private visualizationService: VisualizationService,
                public canvasDimensionService: CanvasDimensionService,
                public appService: AppService) {}

    applyChanges(canvas: BackgroundCanvas, brightness: number, contrast: number, autoContrast= false): void {
        return this.visualizationService.applyChanges(canvas, brightness, contrast, autoContrast);
    }

    applyBrightness(data: Uint8ClampedArray, brightness: number): void {
        return this.visualizationService.applyBrightness(data, brightness);
    }

    applyContrast(data: Uint8ClampedArray, contrast: number): void {
        return this.visualizationService.applyContrast(data, contrast);
    }

    applyAutoContrast(data: Uint8ClampedArray): void {
        return this.visualizationService.applyAutoContrast(data);
    }

    tooglePretreatments(showPretreatments: boolean): void {
        this.canvasDimensionService.backgroundCanvas.tooglePretreatments(showPretreatments);
    }

    get backgroundCanvas(){
        return this.canvasDimensionService.backgroundCanvas;
    }

    set backgroundCanvas(backgroundCanvas) {
        this.canvasDimensionService.backgroundCanvas = backgroundCanvas;
    }
}
