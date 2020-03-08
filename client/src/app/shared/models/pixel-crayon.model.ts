import { Tool } from './tool.model';
import { Point } from './point.model';
import { EditorService } from '../services/Editor/editor.service';
import { LayersService } from '../services/Editor/layers.service';
import { ToolPropertiesService } from '../services/Editor/tool-properties.service';

export class PixelCrayon extends Tool {
    isMouseDown = false;
    lastPoint: Point;

    constructor(name: string, iconPath: string, tooltip: string,
                editorService: EditorService, layersService: LayersService,
                private toolPropertiesService: ToolPropertiesService) {
        super(name, iconPath, tooltip, editorService, layersService);
    }

    // setStrokeProperties(ctx): void {
    //     ctx.globalCompositeOperation = 'source-over';
    //     ctx.lineWidth = this.toolPropertiesService.brushWidth;
    //     ctx.strokeStyle = this.layersService.getCurrentBiomarkerCanvas().color;
    //     ctx.lineCap = 'round';
    // }

    onCursorDown(point: Point): void {
        const currentBiomarker = this.layersService.getCurrentBiomarkerCanvas();
        if (currentBiomarker) {
            this.isMouseDown = true;
            this.lastPoint = point;
            this.updateChangeBoundedBox(point, this.toolPropertiesService.brushWidth / 2);

            let ctx = this.layersService.biomarkerOverlayCanvas.getContext('2d');
            if (this.toolPropertiesService.smartMask) {
                const maskCtx = this.maskContext;
                const drawCtx = this.drawContext;

                // Merge visible biomarkers
                const biomarkerCanvas = this.layersService.getBiomarkerCanvas();
                maskCtx.globalCompositeOperation = 'destination-over';
                biomarkerCanvas.forEach(biomarker => { biomarker.drawCurrentTo(this.maskCanvas); });

                // Current draw context set to drawCanvas
                ctx = drawCtx;
            }

            // this.setStrokeProperties(ctx);
            ctx.beginPath();
            ctx.moveTo(point.x, point.y);
            ctx.lineTo(point.x, point.y);
            ctx.stroke();

            if (this.toolPropertiesService.smartMask) {
                this.applyDrawCanvas(this.layersService.biomarkerOverlayCanvas);
            }
        }
    }

    onCursorMove(point: Point): void {
        if (this.isMouseDown) {
            let ctx;
            if (this.toolPropertiesService.smartMask) {
                ctx = this.drawContext;
            } else {
                ctx = this.layersService.biomarkerOverlayContext;
            }

            if (ctx.lineWidth !== this.toolPropertiesService.brushWidth) {
                ctx.closePath();
                ctx.lineWidth = this.toolPropertiesService.brushWidth;
                ctx.beginPath();
            }
            ctx.moveTo(this.lastPoint.x, this.lastPoint.y);
            ctx.lineTo(point.x, point.y);
            ctx.stroke();

            if (this.toolPropertiesService.smartMask) {
                this.applyDrawCanvas(this.layersService.biomarkerOverlayCanvas);
            }

            this.lastPoint = point;
            this.updateChangeBoundedBox(point, this.toolPropertiesService.brushWidth / 2);
        }
    }

    // onCursorUp(): void {
    //     if (this.isMouseDown) {
    //         const currentBiomarker = this.layersService.getCurrentBiomarkerCanvas();
    //         const overlay = this.layersService.biomarkerOverlayCanvas;
    //         const overlayCtx = overlay.getContext('2d');

    //         if (this.toolPropertiesService.smartMask) {
    //             this.layersService.addToUndoStack(this.layersService.getBiomarkerCanvas());
    //             this.layersService.tempDrawCanvas.getContext('2d').closePath();
    //         } else {
    //             this.layersService.addToUndoStack(new Array<BiomarkerCanvas>(currentBiomarker));
    //             overlayCtx.closePath();
    //         }

    //         // Add the drawn shape to the current biomarker
    //         const ctx = currentBiomarker.getCurrentContext();
    //         ctx.globalCompositeOperation = 'destination-over';
    //         currentBiomarker.drawToCurrentCanvas(overlay, this.changeBoundedBox);

    //         if (this.toolPropertiesService.smartMask) {
    //             const maskCanvas = this.layersService.tempMaskCanvas;
    //             const drawCanvas = this.layersService.tempDrawCanvas;
    //             const maskCtx = maskCanvas.getContext('2d');
    //             const drawCtx = drawCanvas.getContext('2d');

    //             // Remove the drawn shape from every other visible biomarker
    //             this.layersService.getBiomarkerCanvas().forEach(biomarker => {
    //                 if (biomarker.index !== currentBiomarker.index) {
    //                     const bioCtx = biomarker.getCurrentContext();
    //                     bioCtx.save();
    //                     bioCtx.globalCompositeOperation = 'destination-out';
    //                     biomarker.drawToCurrentCanvas(drawCanvas, this.changeBoundedBox);
    //                     bioCtx.restore();
    //                 }
    //             });
    //         }

    //         // Clear overlays and mask
    //         this.onCancel();
    //     }
    // }

    // onCancel(): void {
    //     if (this.isMouseDown) {
    //         this.isMouseDown = false;
    //         this.resetChangeBoundedBox();

    //         const overlay = this.layersService.biomarkerOverlayCanvas;
    //         const overlayCtx = overlay.getContext('2d');
    //         overlayCtx.clearRect(0, 0, overlay.width, overlay.height);

    //         if (this.toolPropertiesService.smartMask) {
    //             const maskCanvas = this.layersService.tempMaskCanvas;
    //             const drawCanvas = this.layersService.tempDrawCanvas;
    //             this.maskContext.clearRect(0, 0, maskCanvas.width, maskCanvas.height);
    //             this.drawContext.clearRect(0, 0, drawCanvas.width, drawCanvas.height);
    //         }
    //     }
    // }

    // onCursorOut(point: Point): void {
    //     this.onCursorUp();
    // }
}
