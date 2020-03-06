import { Canvas } from './canvas.service';


export class BackgroundCanvas extends Canvas {
  // The pretreatmentCanvas contains the pre-processed image
  private pretreatmentCanvas: HTMLCanvasElement;
  private showPretreatmentCanvas = false;

  constructor(displayCanvas: HTMLCanvasElement, image: HTMLImageElement) {
      super(displayCanvas, image);
  }

  setPretreatmentImage(image: HTMLImageElement): void {
      this.pretreatmentCanvas = document.createElement('canvas');
      this.pretreatmentCanvas.width = image.width;
      this.pretreatmentCanvas.height = image.height;
      this.pretreatmentCanvas.getContext('2d').drawImage(image, 0, 0);
  }

  tooglePretreatments(showPretreatmentCanvas: boolean): void {
      this.showPretreatmentCanvas = showPretreatmentCanvas;
      this.currentCanvas.getContext('2d').putImageData(this.getOriginalImageData(), 0, 0);
      this.draw();
  }

  getOriginalContext(): CanvasRenderingContext2D {
      if (this.showPretreatmentCanvas && this.pretreatmentCanvas) {
          return this.pretreatmentCanvas.getContext('2d');
      } else {
          return this.originalCanvas.getContext('2d');
      }
  }

  getOriginalImageData(): ImageData {
      if (this.showPretreatmentCanvas && this.pretreatmentCanvas) {
          return this.getOriginalContext().getImageData(0, 0, this.pretreatmentCanvas.width, this.pretreatmentCanvas.height);
      } else {
          return this.getOriginalContext().getImageData(0, 0, this.originalCanvas.width, this.originalCanvas.height);
      }
  }
}
