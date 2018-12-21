import { Canvas } from './canvas';
import { ImageBorderService } from '../edit-layout/right-menu/biomarkers/image-border.service';
import { RootInjector } from '../root-injector';

export class BiomarkerCanvas extends Canvas {

    // The borderCanvas contains the border of the annotations
    borderCanvas: HTMLCanvasElement;
    drawBorders: boolean;
    private borderService: ImageBorderService;

    constructor(displayCanvas: HTMLCanvasElement, image: HTMLImageElement, public id: string, public color: string, public index: number) {
        super(displayCanvas, image);
        this.borderService = RootInjector.injector.get(ImageBorderService);

        this.drawBorders = false;
        this.borderCanvas = document.createElement('canvas');
        this.borderCanvas.width = image.width;
        this.borderCanvas.height = image.height;
        this.borderCanvas.getContext('2d').drawImage(image, 0, 0);

        const currentCtx = this.getCurrentContext();
        currentCtx.imageSmoothingEnabled = false;
        currentCtx.mozImageSmoothingEnabled = false;
        currentCtx.webkitImageSmoothingEnabled = false;
    }

    draw(): void {
        if (this.drawBorders) {
            this.drawFrom(this.borderCanvas);
        } else {
            super.draw();
        }
    }

    //  Spread the changes from the displayCanvas to the currentCanvas
    updateCurrentCanvas(): void {
        this.currentCanvas.getContext('2d').putImageData(this.getDisplayImageData(), this.offsetX, this.offsetY);
    }

    drawToCurrentCanvas(canvas: HTMLCanvasElement, window?: DOMRect, display= true): void {
        if (!window) {
            window = new DOMRect(this.offsetX, this.offsetY,
                Math.min(this.displayCanvas.width - this.offsetX, this.currentCanvas.width),
                Math.min(this.displayCanvas.height - this.offsetY, this.currentCanvas.height));
        }

        let stupidOffsetX = 0;
        let stupidOffsetY = 0;
        if (this.displayCanvas.width > this.currentCanvas.width) {
            stupidOffsetX = (this.displayCanvas.width - this.currentCanvas.width) / 2;
        }
        if (this.displayCanvas.height > this.currentCanvas.height) {
            stupidOffsetY = (this.displayCanvas.height - this.currentCanvas.height) / 2;
        }

        const destX = window.x + this.offsetX - stupidOffsetX;
        const destY = window.y + this.offsetY - stupidOffsetY;

        this.currentCanvas.getContext('2d').drawImage(canvas, window.x , window.y, window.width, window.height,
                                                      destX, destY, window.width, window.height);

        if (this.drawBorders) {
            this.borderService.erode(this.borderCanvas, this.currentCanvas, destX, destY, window.width + destX, window.height + destY);
        }

        if (display) {
            this.draw();
        }
    }

    putImageData(data: ImageData, x: number, y: number, display= true): void {
        const w = data.width;
        const h = data.height;

        this.getCurrentContext().putImageData(data, x, y);

        if (this.drawBorders) {
            this.borderService.erode(this.borderCanvas, this.currentCanvas, x, y, w + x, h + y);
        }

        if (display) {
            this.draw();
        }
    }

    isVisible(): boolean {
        return this.displayCanvas.style.visibility === 'visible' || this.displayCanvas.style.visibility === '';
    }

    reset(): void {
        this.borderCanvas.getContext('2d').clearRect(0, 0, this.borderCanvas.width, this.borderCanvas.height);
        this.currentCanvas.getContext('2d').clearRect(0, 0, this.currentCanvas.width, this.currentCanvas.height);
        this.displayCanvas.getContext('2d').clearRect(0, 0, this.displayCanvas.width, this.displayCanvas.height);
    }
}
