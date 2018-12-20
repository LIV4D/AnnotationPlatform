import { Tool } from './tool';
import { Point } from './point';
import { BiomarkerCanvas } from './biomarker-canvas';
import { _MatSelectMixinBase } from '@angular/material';

export class LassoEraser extends Tool {

    constructor(name: string, iconPath: string, tooltip: string) {
        super(name, iconPath, tooltip);
    }

    isMouseDown = false;
    lastPoint: Point;



    setStrokeProperties(ctx: CanvasRenderingContext2D): void {
        ctx.globalCompositeOperation = 'source-over';
        ctx.lineWidth = 2;
        ctx.strokeStyle = 'rgb(255,255,255)';
        ctx.fillStyle = 'rgb(255,255,255)';
        ctx.setLineDash([2, 7]);
        ctx.lineCap = 'round';
    }

    onCursorDown( point: Point): void {
        const biomarkerCanvas = this.getBiomarkerCanvas();
        if (biomarkerCanvas) {
            this.isMouseDown = true;
            this.layersService.addFirstPoint();
            const ctx = this.layersService.biomarkerOverlayCanvas.getContext('2d');
            this.setStrokeProperties(ctx);
            ctx.moveTo(point.x, point.y);
            ctx.beginPath();
            ctx.lineTo(point.x, point.y);
            ctx.stroke();
        }
    }

    onCursorMove( point: Point): void {
        if (this.isMouseDown) {
            const ctx = this.layersService.biomarkerOverlayCanvas.getContext('2d');
            ctx.lineTo(point.x, point.y);
            ctx.stroke();
            this.layersService.updateDashStroke();
        }
    }

    onCursorUp(): void {
        if (this.isMouseDown) {
            this.layersService.addToUndoStack(this.getBiomarkerCanvas());

            const overlay = this.layersService.biomarkerOverlayCanvas;
            const overlayCtx = overlay.getContext('2d');
            overlayCtx.clearRect(0, 0, overlay.width, overlay.height);
            overlayCtx.fill();
            overlayCtx.closePath();

            // Remove the drawn shape from every other visible biomarker
            this.getBiomarkerCanvas().forEach(biomarker => {
                const bioCtx = biomarker.getCurrentContext();
                bioCtx.save();
                bioCtx.globalCompositeOperation = 'destination-out';
                biomarker.drawToCurrentCanvas(overlay);
                bioCtx.restore();
            });

            // Clear overlay
            this.onCancel();
        }
    }

    onCancel(): void {
        if (this.isMouseDown) {
            this.layersService.removeFirstPoint();
            const overlay = this.layersService.biomarkerOverlayCanvas;
            this.layersService.biomarkerOverlayContext.clearRect(0, 0, overlay.width, overlay.height);

            this.isMouseDown = false;
        }
    }


    onCursorOut(point: Point): void {
       this.onCancel();
    }

    getBiomarkerCanvas(): BiomarkerCanvas[] {
        return this.toolPropertiesService.eraseAll ? this.layersService.getBiomarkerCanvas()
        : new Array<BiomarkerCanvas>(this.layersService.getCurrentBiomarkerCanvas());
    }

}
