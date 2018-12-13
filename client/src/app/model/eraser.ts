import { LayersService } from './../edit-layout/editor/layers/layers.service';
import { ToolPropertiesService } from './../edit-layout/toolbox/tool-properties/tool-properties.service';
import { Tool } from './tool';
import { Point } from './point';
import { BiomarkerCanvas } from './biomarker-canvas';

export class Eraser extends Tool {

    constructor(name: string, iconPath: string, tooltip: string,
        layersService: LayersService, private toolPropertiesService: ToolPropertiesService) {
        super(name, iconPath, tooltip, layersService);
    }

    isMouseDown = false;
    lastPoint: Point;

    setStrokeProperties(displayContext: CanvasRenderingContext2D): void {
        displayContext.globalCompositeOperation = 'destination-out';

        displayContext.lineWidth = this.toolPropertiesService.brushWidth;
        displayContext.lineCap = 'round';
    }

    onMouseDown( point: Point): void {
        const biomarkerCanvas = this.getBiomarkerCanvas();
        if (biomarkerCanvas) {
            this.isMouseDown = true;
            this.layersService.addToUndoStack(biomarkerCanvas);
            biomarkerCanvas.forEach((biomarker) => {
                const displayContext = biomarker.getDisplayContext();
                this.setStrokeProperties(displayContext);
                displayContext.beginPath();
                displayContext.moveTo(point.x, point.y);
                displayContext.lineTo(point.x, point.y);
                displayContext.stroke();
            });
            this.lastPoint = point;
        }
    }

    onMouseOut(point: Point): void {
        this.onMouseUp();
    }

    onMouseUp(): void {
        if (this.isMouseDown) {
            this.isMouseDown = false;
            const biomarkerCanvas = this.getBiomarkerCanvas();
            biomarkerCanvas.forEach((biomarker) => {
                biomarker.getDisplayContext().globalCompositeOperation = 'source-over';
                biomarker.updateCurrentCanvas();
            });
        }
    }

    onMouseMove( point: Point): void {
        if (this.isMouseDown) {
            const biomarkerCanvas = this.getBiomarkerCanvas();
            biomarkerCanvas.forEach((biomarker) => {
                const displayContext = biomarker.getDisplayContext();
                displayContext.moveTo(this.lastPoint.x, this.lastPoint.y);
                displayContext.lineTo(point.x, point.y);
                displayContext.stroke();
            });
            this.lastPoint = point;
        }
    }

    getBiomarkerCanvas(): BiomarkerCanvas[] {
        return this.toolPropertiesService.eraseAll ? this.layersService.getBiomarkerCanvas()
        : new Array<BiomarkerCanvas>(this.layersService.getCurrentBiomarkerCanvas());
    }

}
