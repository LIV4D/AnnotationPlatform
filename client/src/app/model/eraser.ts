import { Tool } from './tool';
import { Point } from './point';
import { BiomarkerCanvas } from './biomarker-canvas';

export class Eraser extends Tool {

    constructor(name: string, iconPath: string, tooltip: string) {
        super(name, iconPath, tooltip);
    }

    isMouseDown = false;
    lastPoint: Point;

    setStrokeProperties(ctx: CanvasRenderingContext2D): void {
        ctx.lineWidth = this.toolPropertiesService.brushWidth;
        ctx.lineCap = 'round';
    }

    onCursorDown( point: Point): void {
        const biomarkerCanvas = this.getBiomarkerCanvas();
        if (biomarkerCanvas) {
            this.isMouseDown = true;

            this.drawContext.drawImage(this.editorService.backgroundCanvas.displayCanvas, 0, 0);

            const ctx = this.maskContext;
            this.setStrokeProperties(ctx);
            ctx.beginPath();
            ctx.moveTo(point.x, point.y);
            ctx.lineTo(point.x, point.y);
            ctx.stroke();

            this.applyDrawCanvas(this.layersService.biomarkerOverlayCanvas);
            this.lastPoint = point;

            this.updateChangeBoundedBox(point, this.toolPropertiesService.brushWidth / 2);
        }
    }

    onCursorMove( point: Point): void {
        if (this.isMouseDown) {
            const ctx = this.maskContext;

            ctx.moveTo(this.lastPoint.x, this.lastPoint.y);
            ctx.lineWidth = this.toolPropertiesService.brushWidth;
            ctx.lineTo(point.x, point.y);
            ctx.stroke();
            this.applyDrawCanvas(this.layersService.biomarkerOverlayCanvas);
            this.lastPoint = point;

            this.updateChangeBoundedBox(point, this.toolPropertiesService.brushWidth / 2);
        }
    }

    onCursorUp(): void {
        if (this.isMouseDown) {
            const mask = this.maskCanvas;
            const biomarkers = this.getBiomarkerCanvas();
            this.layersService.addToUndoStack(biomarkers);

            biomarkers.forEach((biomarker) => {
                const ctx = biomarker.getCurrentContext();
                ctx.globalCompositeOperation = 'destination-out';
                biomarker.drawToCurrentCanvas(mask, this.changeBoundedBox);
            });

            // Clear mask and overlay
            this.onCancel();
        }
    }

    onCancel(): void {
        if (this.isMouseDown) {
            this.isMouseDown = false;

            const mask = this.maskCanvas;
            this.maskContext.clearRect(0, 0, mask.width, mask.height);
            const draw = this.drawCanvas;
            this.drawContext.clearRect(0, 0, draw.width, draw.height);

            const overlay = this.layersService.biomarkerOverlayCanvas;
            this.layersService.biomarkerOverlayContext.clearRect(0, 0, overlay.width, overlay.height);

            this.resetChangeBoundedBox();
        }
    }

    onCursorOut(point: Point): void {
        this.onCursorUp();
    }


    getBiomarkerCanvas(): BiomarkerCanvas[] {
        return this.toolPropertiesService.eraseAll ? this.layersService.getBiomarkerCanvas()
        : new Array<BiomarkerCanvas>(this.layersService.getCurrentBiomarkerCanvas());
    }

}
