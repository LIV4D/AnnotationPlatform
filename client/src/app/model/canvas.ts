export class Canvas {
    // The original canvas contains the original image and should not be change
    originalCanvas: HTMLCanvasElement;
    // The current canvas contains all the modifications
    currentCanvas: HTMLCanvasElement;

    // The offsets represent the distance from the top left corner of the originalCanvas to the top
    // left corner of the displayCanvas. Its values are a result of zooming.
    offsetX = 0;
    offsetY = 0;

    constructor(public displayCanvas: HTMLCanvasElement, image: HTMLImageElement) {
        this.originalCanvas = document.createElement('canvas');
        this.originalCanvas.width = image.width;
        this.originalCanvas.height = image.height;
        this.originalCanvas.getContext('2d').drawImage(image, 0, 0);

        this.currentCanvas = document.createElement('canvas');
        this.currentCanvas.width = image.width;
        this.currentCanvas.height = image.height;
        this.currentCanvas.getContext('2d').drawImage(image, 0, 0);
    }

    // Erase the display canvas.
    clear(): void {
        this.displayCanvas.getContext('2d').clearRect(0, 0, this.displayCanvas.width, this.displayCanvas.height);
    }

    // Update when vertical empty space exists.
    draw(): void {
        this.drawFrom(this.currentCanvas);
    }

    // Changes the displayCanvas according to the offsets and the canvas pass as a parameter.
    drawFrom(canvas: HTMLCanvasElement): void {
        const context = this.displayCanvas.getContext('2d');
        context.clearRect(0, 0, this.displayCanvas.width, this.displayCanvas.height);
        let correctionX = 0, correctionY = 0;
        if (this.displayCanvas.width > canvas.width) {
            correctionX = (this.displayCanvas.width - canvas.width) / 2;
        }
        if (this.displayCanvas.height > this.currentCanvas.height) {
            correctionY = (this.displayCanvas.height - canvas.height) / 2;
        }
        const w = Math.min(this.displayCanvas.width, canvas.width);
        const h = Math.min(this.displayCanvas.height, canvas.height);
        context.drawImage(
            canvas,
            this.offsetX, // Source x
            this.offsetY, // Source y
            w, // Source width
            h, // Source height
            correctionX, // Destination x
            correctionY, // Destination y
            w, // Destination width
            h // Destination height
        );
    }


    drawCurrentTo(canvas: HTMLCanvasElement): void {
        const context = canvas.getContext('2d');
        let correctionX = 0, correctionY = 0;
        if (canvas.width > this.currentCanvas.width) {
            correctionX = (canvas.width - this.currentCanvas.width) / 2;
        }
        if (canvas.height > this.currentCanvas.height) {
            correctionY = (canvas.height - this.currentCanvas.height) / 2;
        }
        const w = Math.min(this.currentCanvas.width, canvas.width);
        const h = Math.min(this.currentCanvas.height, canvas.height);
        context.drawImage(
            this.currentCanvas,
            this.offsetX, // Source x
            this.offsetY, // Source y
            w, // Source width
            h, // Source height
            correctionX, // Destination x
            correctionY, // Destination y
            w, // Destination width
            h // Destination height
        );
        
    }

    getDisplayContext(): CanvasRenderingContext2D {
        return this.displayCanvas.getContext('2d');
    }

    getCurrentContext(): CanvasRenderingContext2D {
        return this.currentCanvas.getContext('2d');
    }

    getCurrentImageData(): ImageData {
        return this.currentCanvas.getContext('2d').getImageData(0, 0, this.currentCanvas.width, this.currentCanvas.height);
    }

    getDisplayImageData(): ImageData {
        let x = 0, y = 0;
        if (this.displayCanvas.width > this.currentCanvas.width) {
            x = (this.displayCanvas.width - this.currentCanvas.width) / 2;
        }
        if (this.displayCanvas.height > this.currentCanvas.height) {
            y = (this.displayCanvas.height - this.currentCanvas.height) / 2;
        }
        const w = Math.min(this.displayCanvas.width, this.currentCanvas.width);
        const h = Math.min(this.displayCanvas.height, this.currentCanvas.height);
        return this.displayCanvas.getContext('2d').getImageData(x, y, w, h);
    }

    setOffset(offsetX: number, offsetY: number): void {
        this.offsetX = offsetX;
        this.offsetY = offsetY;
    }
}
