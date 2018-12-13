import { LayersService } from './../edit-layout/editor/layers/layers.service';
import { ToolPropertiesService } from './../edit-layout/toolbox/tool-properties/tool-properties.service';
import { Tool } from './tool';
import { Point } from './point';
import { BiomarkerCanvas } from './biomarker-canvas';
import { _MatSelectMixinBase } from '@angular/material';

export class LassoEraser extends Tool {

    constructor(name: string, iconPath: string, tooltip: string, 
        layersService: LayersService, private toolPropertiesService: ToolPropertiesService) {
        super(name, iconPath, tooltip, layersService);
    }

    isMouseDown = false;
    lastPoint: Point;



    setStrokeProperties(ctx: CanvasRenderingContext2D): void{
        ctx.globalCompositeOperation = 'source-over';
        ctx.lineWidth = 2;
        ctx.strokeStyle = "rgb(255,255,255)";
        ctx.fillStyle = "rgb(255,255,255)";
        ctx.setLineDash([2, 7]);
        ctx.lineCap = 'round';
    }

    onMouseDown( point: Point): void {
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

    onMouseOut(point: Point): void {
        if (this.isMouseDown) {
            this.layersService.removeFirstPoint();
            this.isMouseDown = false;
            this.layersService.popUndoStack();
            const overlay = this.layersService.biomarkerOverlayCanvas;
            overlay.getContext('2d').clearRect(0,0,overlay.width, overlay.height);
        }
    }

    onMouseUp(): void {
        if (this.isMouseDown) {
            this.isMouseDown = false;
            this.layersService.addToUndoStack(this.getBiomarkerCanvas());
            this.layersService.removeFirstPoint();

            const currentBiomarker = this.layersService.getCurrentBiomarkerCanvas();
            const overlay = this.layersService.biomarkerOverlayCanvas;
            const overlayCtx = overlay.getContext('2d');
            overlayCtx.clearRect(0,0,overlay.width, overlay.height);
            overlayCtx.fill();
            overlayCtx.closePath();
            
            // Remove the drawn shape from every other visible biomarker
            this.getBiomarkerCanvas().forEach(biomarker => {
                const bioCtx = biomarker.getDisplayContext();
                bioCtx.save();
                bioCtx.globalCompositeOperation = 'destination-out';
                bioCtx.drawImage(overlay, 0, 0);
                bioCtx.restore();
                biomarker.updateCurrentCanvas();
            });

            overlayCtx.clearRect(0,0,overlay.width, overlay.height);
        }
    }

    onMouseMove( point: Point): void {
        if (this.isMouseDown) {
            const ctx = this.layersService.biomarkerOverlayCanvas.getContext('2d');
            ctx.lineTo(point.x, point.y);
            ctx.stroke();
            this.layersService.updateDashStroke();
        }
    }

    getBiomarkerCanvas(): BiomarkerCanvas[] {
        return this.toolPropertiesService.eraseAll ? this.layersService.getBiomarkerCanvas()
        : new Array<BiomarkerCanvas>(this.layersService.getCurrentBiomarkerCanvas());
    }

}
