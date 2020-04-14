import { Canvas } from './canvas.service';
import { ImageBorderService } from './../image-border.service';
import { Comment } from './../../../models/comment.model';
import { LogoutService } from '../../logout.service';

export class BiomarkerCanvas extends Canvas {

    // The borderCanvas contains the border of the annotations
    borderCanvas: HTMLCanvasElement;
    drawBorders: boolean;
    drawShadows: boolean;
    private invertedColor: string;
    public commentsList: Array<Comment> = new Array<Comment>();

    constructor(
        displayCanvas: HTMLCanvasElement, image: HTMLImageElement, public id: string,
        public color: string, public index: number,
        private imageBorderService: ImageBorderService) {

        super(displayCanvas, image);

        this.drawBorders = false;
        this.drawShadows = false;
        this.borderCanvas = document.createElement('canvas');
        this.borderCanvas.width = image.width;
        this.borderCanvas.height = image.height;
        this.borderCanvas.getContext('2d').drawImage(image, 0, 0);
        this.color = color;
        const currentCtx = this.getCurrentContext();
        currentCtx.imageSmoothingEnabled = false;
    }

    lightenColor(hex): string {
        if (hex.indexOf('#') === 0) {
            hex = hex.slice(1);
        }
        // convert 3-digit hex to 6-digits.
        if (hex.length === 3) {
            hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
        }
        if (hex.length !== 6) {
            throw new Error('Invalid HEX color.');
        }
        // invert color components
        const r = Math.min(50 + parseInt(hex.slice(0, 2), 16), 255).toString(16);
        const g = Math.min(50 + parseInt(hex.slice(2, 4), 16), 255).toString(16);
        const b = Math.min(50 + parseInt(hex.slice(4, 6), 16), 255).toString(16);
        // pad each with zeros and return
        return '#' + r + g + b;
    }

    draw(): void {
        const context = this.displayCanvas.getContext('2d');

        if (this.drawShadows) {
            context.shadowBlur = 5;
            context.shadowColor = this.lightenColor(this.color);
        } else {
            context.shadowBlur = 0;
        }

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

    drawToCurrentCanvas(canvas: HTMLCanvasElement, window?: DOMRect, display = true): void {
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

        console.log(stupidOffsetX);
        console.log(stupidOffsetY);

        console.log(destX);
        console.log(destY);

        this.currentCanvas.getContext('2d').drawImage(canvas, window.x, window.y, window.width, window.height,
            destX, destY, window.width, window.height);

        if (this.drawBorders) {
            this.imageBorderService.erode(this.borderCanvas, this.currentCanvas, destX, destY, window.width + destX, window.height + destY);
        }

        if (display) {
            this.draw();
        }
    }

    putImageData(data: ImageData, x: number, y: number, display = true): void {
        const w = data.width;
        const h = data.height;

        this.getCurrentContext().putImageData(data, x, y);

        if (this.drawBorders) {
            this.imageBorderService.erode(this.borderCanvas, this.currentCanvas, x, y, w + x, h + y);
        }

        if (display) {
            this.draw();
        }
    }

    isVisible(): boolean {
        return this.displayCanvas.style.visibility === 'visible';
    }

    setVisibility(isVisible: boolean){
        this.displayCanvas.style.visibility = isVisible ? 'visible' : 'hidden';
    }

    reset(): void {
        this.borderCanvas.getContext('2d').clearRect(0, 0, this.borderCanvas.width, this.borderCanvas.height);
        this.currentCanvas.getContext('2d').clearRect(0, 0, this.currentCanvas.width, this.currentCanvas.height);
        this.displayCanvas.getContext('2d').clearRect(0, 0, this.displayCanvas.width, this.displayCanvas.height);
    }
}
