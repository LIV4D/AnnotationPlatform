import { Tool, ToolServices } from './tool';
import { Point } from './point';
import { BiomarkerCanvas } from './biomarker-canvas';

export class PointByPointBucket extends Tool {

    public MAX_DISTANCE_X = 5;
    public MAX_DISTANCE_Y = 5;

    constructor(name: string, iconPath: string, tooltip: string, toolServices: ToolServices) {
        super(name, iconPath, tooltip, toolServices);
    }

    firstPoint: Point = null;

    setStrokeProperties(): void {
        const displayContext = this.layersService.getCurrentBiomarkerCanvas().getDisplayContext();

        displayContext.globalCompositeOperation = 'source-over';
        displayContext.lineWidth = 3;
        displayContext.strokeStyle = this.layersService.getCurrentBiomarkerCanvas().color;
        displayContext.fillStyle = this.layersService.getCurrentBiomarkerCanvas().color;
        displayContext.lineCap = 'round';
    }

    onCursorDown(point: Point): void {
        const currentBiomarker = this.layersService.getCurrentBiomarkerCanvas();
        if (currentBiomarker) {
            if (this.firstPoint == null) {
                this.firstPoint = point;
                this.layersService.addFirstPoint();
                this.layersService.addToUndoStack(new Array<BiomarkerCanvas>(currentBiomarker));
                const displayContext = this.layersService.getCurrentBiomarkerCanvas().getDisplayContext();
                this.setStrokeProperties();
                displayContext.beginPath();
                displayContext.moveTo(point.x, point.y);
                displayContext.lineTo(point.x, point.y);
                displayContext.stroke();
            } else {
                const displayContext = this.layersService.getCurrentBiomarkerCanvas().getDisplayContext();
                displayContext.lineTo(point.x, point.y);
                displayContext.stroke();
                if (this.isNearFirstPoint(point)) {
                    this.firstPoint = null;
                    this.layersService.removeFirstPoint();
                    const canvas = this.layersService.getCurrentBiomarkerCanvas();
                    const context = canvas.getDisplayContext();
                    context.fill();
                    context.closePath();
                    canvas.updateCurrentCanvas();
                }
            }
        }
    }

    onCursorMove(point: Point): void {
        if (this.firstPoint) {
            if (this.isNearFirstPoint(point)) {
                this.layersService.nearFirstPoint();
            } else {
                this.layersService.farFirstPoint();
            }
        }
    }

    onCancel(): void {
        if (this.firstPoint) {
            this.layersService.removeFirstPoint();
            this.layersService.popUndoStack();
            const biomarker = this.layersService.getCurrentBiomarkerCanvas();
            biomarker.draw();
            this.firstPoint = null;
        }
    }

    onCursorOut(point: Point): void {
        this.onCancel();
    }

    isNearFirstPoint(point: Point): boolean {
        const isCloseInX = point.x >= this.firstPoint.x - (this.MAX_DISTANCE_X / this.editorService.canvasDisplayRatio.getValue())
        && point.x <= this.firstPoint.x + (this.MAX_DISTANCE_X / this.editorService.canvasDisplayRatio.getValue());
        const isCloseInY = point.y >= this.firstPoint.y - (this.MAX_DISTANCE_Y / this.editorService.canvasDisplayRatio.getValue())
        && point.y <= this.firstPoint.y + (this.MAX_DISTANCE_Y / this.editorService.canvasDisplayRatio.getValue());
        return isCloseInX && isCloseInY;
    }
}
