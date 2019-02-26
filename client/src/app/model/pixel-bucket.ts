import { LayersService } from './../edit-layout/editor/layers/layers.service';
import { ToolPropertiesService } from './../edit-layout/toolbox/tool-properties/tool-properties.service';
import { Tool, ToolServices } from './tool';
import { Point } from './point';
import { BiomarkerCanvas } from './biomarker-canvas';
import { _MatSelectMixinBase } from '@angular/material';

export class PixelBucket extends Tool {

    constructor(name: string, iconPath: string, tooltip: string, toolServices: ToolServices) {
        super(name, iconPath, tooltip, toolServices);
    }

    isMouseDown = false;

    setStrokeProperties(ctx: CanvasRenderingContext2D): void {
        ctx.globalCompositeOperation = 'source-over';
        ctx.lineWidth = 1;
        ctx.strokeStyle = this.layersService.getCurrentBiomarkerCanvas().color;
        ctx.fillStyle = this.layersService.getCurrentBiomarkerCanvas().color;
        ctx.lineCap = 'round';
    }

    onCursorDown( point: Point): void {
        const currentBiomarker = this.layersService.getCurrentBiomarkerCanvas();
        if (currentBiomarker) {
            this.isMouseDown = true;
            this.updateChangeBoundedBox(point);

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

            this.updateChangeBoundedBox(point);
        }
    }

    onCursorUp(): void {
        if (this.isMouseDown) {

            const currentBiomarker = this.layersService.getCurrentBiomarkerCanvas();
            const overlay = this.layersService.biomarkerOverlayCanvas;
            const overlayCtx = overlay.getContext('2d');
            overlayCtx.clearRect(0, 0, overlay.width, overlay.height);
            overlayCtx.fill();
            overlayCtx.closePath();

            if (this.toolPropertiesService.smartMask) {
                this.layersService.addToUndoStack(this.layersService.getBiomarkerCanvas());

                const mask = this.layersService.tempMaskCanvas;
                const maskCtx = mask.getContext('2d');

                // Merge visible biomarkers
                maskCtx.save();
                const biomarkerCanvas = this.layersService.getBiomarkerCanvas();
                biomarkerCanvas.forEach(biomarker => {biomarker.drawCurrentTo(mask); });
                maskCtx.globalCompositeOperation = 'source-in';
                maskCtx.drawImage(overlay, 0, 0);
                maskCtx.restore();

                // Add the drawn shape to the current biomarker
                currentBiomarker.drawToCurrentCanvas(mask, this.changeBoundedBox);

                // Remove the drawn shape from every other visible biomarker
                this.layersService.getBiomarkerCanvas().forEach(biomarker => {
                    if (biomarker.index !== currentBiomarker.index) {
                        const bioCtx = biomarker.getCurrentContext();
                        bioCtx.save();
                        bioCtx.globalCompositeOperation = 'destination-out';
                        biomarker.drawToCurrentCanvas(overlay, this.changeBoundedBox);
                        bioCtx.restore();
                    }
                });

                // Clear mask canvas
                maskCtx.clearRect(0, 0, mask.width, mask.height);
            } else {
                this.layersService.addToUndoStack(new Array<BiomarkerCanvas>(currentBiomarker));
                currentBiomarker.drawToCurrentCanvas(overlay, this.changeBoundedBox);
            }

            // Clear overlay and tool visual helper
            this.onCancel();
        }
    }

    onCancel(): void {
        if (this.isMouseDown) {
            this.isMouseDown = false;
            this.resetChangeBoundedBox();

            this.layersService.removeFirstPoint();
            const overlay = this.layersService.biomarkerOverlayCanvas;
            this.layersService.biomarkerOverlayContext.clearRect(0, 0, overlay.width, overlay.height);
        }
    }

    onCursorOut(point: Point): void {
        this.onCancel();
    }

}
