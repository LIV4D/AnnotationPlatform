import { Tool } from './tool';
import { Point } from './point';
import { BiomarkerCanvas } from './biomarker-canvas';
import { CurrencyIndex } from '@angular/common/src/i18n/locale_data';

export class PixelCrayon extends Tool {

    isMouseDown = false;
    lastPoint: Point;

    constructor(name: string, iconPath: string, tooltip: string) {
        super(name, iconPath, tooltip);
    }

    setStrokeProperties(ctx): void {
        ctx.globalCompositeOperation = 'source-over';
        ctx.lineWidth = this.toolPropertiesService.brushWidth;
        ctx.strokeStyle = this.layersService.getCurrentBiomarkerCanvas().color;
        ctx.lineCap = 'round';
    }

    onCursorDown( point: Point): void {
        const currentBiomarker = this.layersService.getCurrentBiomarkerCanvas();
        if (currentBiomarker) {
            this.isMouseDown = true;
            this.lastPoint = point;

            let ctx = this.layersService.biomarkerOverlayCanvas.getContext('2d');
            if (this.toolPropertiesService.smartMask) {
                const maskCtx = this.maskContext;
                const drawCtx = this.drawContext;

                // Merge visible biomarkers
                const biomarkerCanvas = this.layersService.getBiomarkerCanvas();
                maskCtx.globalCompositeOperation = 'destination-over';
                biomarkerCanvas.forEach(biomarker => {maskCtx.drawImage(biomarker.displayCanvas, 0, 0); });

                // Current draw context set to drawCanvas
                ctx = drawCtx;
            }

            this.setStrokeProperties(ctx);
            ctx.beginPath();
            ctx.moveTo(point.x, point.y);
            ctx.lineTo(point.x, point.y);
            ctx.stroke();

            if (this.toolPropertiesService.smartMask) {
                this.applyDrawCanvas(this.layersService.biomarkerOverlayCanvas);
            }
        }
    }

    onCursorMove( point: Point): void {
        if (this.isMouseDown) {
            let ctx;
            if (this.toolPropertiesService.smartMask) {
                ctx = this.drawContext;
            } else {
                ctx = this.layersService.biomarkerOverlayContext;
            }

            // ctx.moveTo(this.lastPoint.x, this.lastPoint.y);
            ctx.lineTo(point.x, point.y);
            ctx.stroke();

            if (this.toolPropertiesService.smartMask) {
                this.applyDrawCanvas(this.layersService.biomarkerOverlayCanvas);
            }

            this.lastPoint = point;
        }
    }

    onCursorUp(): void {
        if (this.isMouseDown) {
            const currentBiomarker = this.layersService.getCurrentBiomarkerCanvas();
            const overlay = this.layersService.biomarkerOverlayCanvas;
            const overlayCtx = overlay.getContext('2d');

            if (this.toolPropertiesService.smartMask) {
                this.layersService.addToUndoStack(this.layersService.getBiomarkerCanvas());
                this.layersService.tempDrawCanvas.getContext('2d').closePath();
            } else {
                this.layersService.addToUndoStack(new Array<BiomarkerCanvas>(currentBiomarker));
                overlayCtx.closePath();
            }

            // Add the drawn shape to the current biomarker
            const ctx = currentBiomarker.getDisplayContext();
            ctx.globalCompositeOperation = 'destination-over';
            ctx.drawImage(overlay, 0, 0);
            currentBiomarker.updateCurrentCanvas();

            if (this.toolPropertiesService.smartMask) {
                const maskCanvas = this.layersService.tempMaskCanvas;
                const drawCanvas = this.layersService.tempDrawCanvas;
                const maskCtx = maskCanvas.getContext('2d');
                const drawCtx = drawCanvas.getContext('2d');

                // Remove the drawn shape from every other visible biomarker
                this.layersService.getBiomarkerCanvas().forEach(biomarker => {
                            if (biomarker.index !== currentBiomarker.index) {
                                const bioCtx = biomarker.getDisplayContext();
                                bioCtx.save();
                                bioCtx.globalCompositeOperation = 'destination-out';
                                bioCtx.drawImage(drawCanvas, 0, 0);
                                bioCtx.restore();
                                biomarker.updateCurrentCanvas();
                            }
                        });
            }

            // Clear overlays and mask
            this.onCancel();
        }
    }

    onCancel(): void {
        if (this.isMouseDown) {
            this.isMouseDown = false;
            const overlay = this.layersService.biomarkerOverlayCanvas;
            const overlayCtx = overlay.getContext('2d');
            overlayCtx.clearRect(0, 0, overlay.width, overlay.height);

            if (this.toolPropertiesService.smartMask) {
                const maskCanvas = this.layersService.tempMaskCanvas;
                const drawCanvas = this.layersService.tempDrawCanvas;
                this.maskContext.clearRect(0, 0, maskCanvas.width, maskCanvas.height);
                this.drawContext.clearRect(0, 0, drawCanvas.width, drawCanvas.height);
            }
        }
    }

    onCursorOut(point: Point): void {
        this.onCursorUp();
    }


}
