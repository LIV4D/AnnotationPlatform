import { Canvas } from './canvas';

export class BiomarkerCanvas extends Canvas {

    // The borderCanvas contains the border of the annotations
    borderCanvas: HTMLCanvasElement;
    drawBorders: boolean;

    constructor(displayCanvas: HTMLCanvasElement, image: HTMLImageElement, public id: string, public color: string, public index: number) {
        super(displayCanvas, image);
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

    isVisible(): boolean {
        return this.displayCanvas.style.visibility === 'visible' || this.displayCanvas.style.visibility === '';
    }

    reset(): void {
        this.borderCanvas.getContext('2d').clearRect(0, 0, this.borderCanvas.width, this.borderCanvas.height);
        this.currentCanvas.getContext('2d').clearRect(0, 0, this.currentCanvas.width, this.currentCanvas.height);
        this.displayCanvas.getContext('2d').clearRect(0, 0, this.displayCanvas.width, this.displayCanvas.height);
    }
}
