import { LayersService } from './../edit-layout/editor/layers/layers.service';
import { ToolPropertiesService } from './../edit-layout/toolbox/tool-properties/tool-properties.service';
import { Tool } from './tool';
import { Point } from './point';
import { BiomarkerCanvas } from './biomarker-canvas';
import { _MatSelectMixinBase } from '@angular/material';

export class PixelBucket extends Tool {

    constructor(name: string, iconPath: string, tooltip: string, 
        layersService: LayersService, private toolPropertiesService: ToolPropertiesService) {
        super(name, iconPath, tooltip, layersService);
    }

    isMouseDown = false;

    setStrokeProperties(ctx: CanvasRenderingContext2D): void {
        ctx.globalCompositeOperation = 'source-over';
        ctx.lineWidth = 1;
        ctx.strokeStyle = this.layersService.getCurrentBiomarkerCanvas().color;
        ctx.fillStyle = this.layersService.getCurrentBiomarkerCanvas().color;
        ctx.lineCap = 'round';
    }

    onMouseDown( point: Point): void {
        const currentBiomarker = this.layersService.getCurrentBiomarkerCanvas();
        if (currentBiomarker) {
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

            this.layersService.removeFirstPoint();

            const currentBiomarker = this.layersService.getCurrentBiomarkerCanvas();
            const overlay = this.layersService.biomarkerOverlayCanvas;
            const overlayCtx = overlay.getContext('2d');
            overlayCtx.clearRect(0,0,overlay.width, overlay.height);
            overlayCtx.fill();
            overlayCtx.closePath();
            
            if(this.toolPropertiesService.smartMask){
                this.layersService.addToUndoStack(this.layersService.getBiomarkerCanvas());

                const mask = this.layersService.tempMaskCanvas;
                const maskCtx = mask.getContext('2d');

                // Merge visible biomarkers
                maskCtx.save();
                const biomarkerCanvas = this.layersService.getBiomarkerCanvas();
                biomarkerCanvas.forEach(biomarker => {maskCtx.drawImage(biomarker.displayCanvas,0,0);});
                maskCtx.globalCompositeOperation = 'source-in';
                maskCtx.drawImage(overlay,0,0);
                maskCtx.restore();

                // Add the drawn shape to the current biomarker
                currentBiomarker.getDisplayContext().drawImage(mask,0,0);
                currentBiomarker.updateCurrentCanvas();

                // Remove the drawn shape from every other visible biomarker
                this.layersService.getBiomarkerCanvas().forEach(biomarker => {
                    if(biomarker.index!=currentBiomarker.index){
                        const bioCtx = biomarker.getDisplayContext();
                        bioCtx.save()
                        bioCtx.globalCompositeOperation='destination-out';
                        bioCtx.drawImage(overlay, 0, 0);
                        bioCtx.restore();
                        biomarker.updateCurrentCanvas();
                    }
                });

                // Clear mask canvas
                maskCtx.clearRect(0,0,mask.width, mask.height);
            }else{
                this.layersService.addToUndoStack(new Array<BiomarkerCanvas>(currentBiomarker));
                currentBiomarker.getDisplayContext().drawImage(overlay,0,0);
                currentBiomarker.updateCurrentCanvas();
            }
            
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

}
