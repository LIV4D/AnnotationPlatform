import { Injectable} from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { LayersService } from './layers.service';
import { BackgroundCanvas } from './tools/background-canvas.service';
import { ZoomService } from './zoom.service';
import { ViewportService } from './viewport.service';
import { Point } from './tools/point.service';

@Injectable({
  providedIn: 'root',
})
export class CanvasDimensionService {
  backgroundCanvas: BackgroundCanvas;
  canvasDisplayRatio: BehaviorSubject<number>;
  fullCanvasWidth: number;
  fullCanvasHeight: number;
  offsetX: number;
  offsetY: number;
  scaleX: number;
  canRedraw = true;

  constructor(public layersService: LayersService, private zoomService: ZoomService,
              public viewPortService: ViewportService) {}

  // Return the width/height ratio of the original image.
  originalImageRatio(): number {
    return (
      this.backgroundCanvas.originalCanvas.width /
      this.backgroundCanvas.originalCanvas.height
    );
  }

   // Reads the current display canvas dimensions and update canvasDisplayRatio.
   updateCanvasDisplayRatio(): void {
    const ratio =
      this.backgroundCanvas.displayCanvas.getBoundingClientRect().width /
      this.backgroundCanvas.displayCanvas.width;
      this.canvasDisplayRatio.next(ratio);
  }

  // Function to adjust the offsets to keep a coherent editor.
  // Returns true if an adjustment was made, false otherwise.
  adjustOffsets(): boolean {
    const oldXOffset = this.offsetX;
    const oldYOffset = this.offsetY;

    // The offsets are always positive.
    this.offsetX = Math.max(0, this.offsetX);
    this.offsetY = Math.max(0, this.offsetY);
    // The offsets must not be too large as to create empty space.
    if (this.backgroundCanvas.originalCanvas.width > this.backgroundCanvas.displayCanvas.width) {
      this.offsetX = Math.min(this.backgroundCanvas.originalCanvas.width - this.backgroundCanvas.displayCanvas.width,
        this.offsetX);
    } else {
      this.offsetX = 0;
    }

    if (this.backgroundCanvas.originalCanvas.height > this.backgroundCanvas.displayCanvas.height
    ) {
      this.offsetY = Math.min(this.backgroundCanvas.originalCanvas.height - this.backgroundCanvas.displayCanvas.height,
                              this.offsetY);
    } else {
      this.offsetY = 0;
    }
    // Turn the offsets to integers to avoid problems with pixel math.
    this.offsetX = Math.floor(this.offsetX);
    this.offsetY = Math.floor(this.offsetY);
    return oldXOffset !== this.offsetX || oldYOffset !== this.offsetY;
  }

  // Function to update the zoom rectangle.
  updateZoomRect(): void {
    const zoomCanvas: HTMLCanvasElement = document.getElementById('zoom-canvas') as HTMLCanvasElement;
    if (zoomCanvas !== null) {
      const zoomContext: CanvasRenderingContext2D = zoomCanvas.getContext('2d');
      zoomContext.clearRect(0, 0, zoomCanvas.width, zoomCanvas.height);   // Clear the canvas
      zoomContext.drawImage(this.backgroundCanvas.originalCanvas, 0, 0);  // Redraw the image

      // Redraw the zoom rectangle (unless completely zoomed out).
      if (this.zoomService.zoomFactor === 1.0) {
        return;
      }
      const realHeight = this.backgroundCanvas.displayCanvas.getBoundingClientRect().height;
      const realWidth = this.backgroundCanvas.displayCanvas.getBoundingClientRect().width;
      let h: number; let w: number;
      if (this.originalImageRatio() > this.viewPortService.viewportRatio()) {
        w = zoomCanvas.width / this.zoomService.zoomFactor;
        h = Math.min(w * (realHeight / realWidth), zoomCanvas.height);
      } else {
        h = zoomCanvas.height / this.zoomService.zoomFactor;
        w = Math.min(h * (realWidth / realHeight), zoomCanvas.width);
      }
      const x = (this.offsetX / this.backgroundCanvas.displayCanvas.width) * w;
      const y = (this.offsetY / this.backgroundCanvas.displayCanvas.height) * h;

      zoomContext.strokeStyle = 'white';
      zoomContext.lineWidth = 20;
      zoomContext.strokeRect(x, y, w, h);
    }
  }

  // Function that transforms the editor view according to the zoomFactor and offsets properties.
  transform(): void {
    if (!this.backgroundCanvas || !this.backgroundCanvas.originalCanvas) {
      return;
    }
    this.backgroundCanvas.setOffset(this.offsetX, this.offsetY);
    this.backgroundCanvas.draw();

    this.layersService.biomarkerCanvas.forEach(layer => {
      layer.setOffset(this.offsetX, this.offsetY);
      layer.draw();
    });
    this.updateZoomRect(); //Redraw the zoom rectangle.
  }

  // Reajust the display
  applyRedraw(position: Point) {
    const zoomFactor = this.zoomService.zoomFactor;                // in order to get the new selection's width to zoom at
    const oldWidth = this.backgroundCanvas.displayCanvas.width;    // Adjust canvas sizes.
    const oldHeight = this.backgroundCanvas.displayCanvas.height;  // divide by the zoom factor
    const newWidth = this.fullCanvasWidth / zoomFactor;
    const newHeight = this.fullCanvasHeight / zoomFactor;
    this.backgroundCanvas.displayCanvas.width = newWidth;
    this.backgroundCanvas.displayCanvas.height = newHeight;

    this.layersService.resize(newWidth, newHeight);

    if (zoomFactor !== this.zoomService.ZOOM.MIN && zoomFactor !== this.zoomService.ZOOM.MAX) {
       this.zoomService.zoomFactor = zoomFactor;

      // Adjust offsets to keep them coherent with the previous zoom.
      let positionXPercentage = 0.5; let positionYPercentage = 0.5;

      if (position !== null) {
        positionXPercentage = Math.min(Math.max(position.x / oldWidth, 0), 1);  // 0 <= X <= 1
        positionYPercentage = Math.min(Math.max(position.y / oldHeight, 0), 1); // 0 <= Y <= 1
      }
      const deltaX = (oldWidth - newWidth) * positionXPercentage;
      const deltaY = (oldHeight - newHeight) * positionYPercentage;
      this.offsetX += deltaX;
      this.offsetY += deltaY;
    }
    this.adjustOffsets();
    this.transform();
    this.updateCanvasDisplayRatio();
  }

  // Function to change the offsets to match a new center.
  moveCenter(percentX: number, percentY: number): void {;
    const displayW = this.backgroundCanvas.displayCanvas.width > this.backgroundCanvas.originalCanvas.width
      ? this.backgroundCanvas.originalCanvas.width
      : this.backgroundCanvas.displayCanvas.width;
    const displayH = this.backgroundCanvas.displayCanvas.height > this.backgroundCanvas.originalCanvas.height
      ? this.backgroundCanvas.originalCanvas.height
      : this.backgroundCanvas.displayCanvas.height;
    this.offsetX = this.backgroundCanvas.originalCanvas.width * percentX - displayW / 2;
    this.offsetY = this.backgroundCanvas.originalCanvas.height * percentY - displayH / 2;
    this.adjustOffsets();
    this.transform();
  }

  // Function to zoom on a part of the image.
  // Currently only centered with specific ratios.
  zoom(delta: number, position: Point = null): void {
    this.zoomService.updateZoomFactor(delta);
    if (this.canRedraw) {
      this.canRedraw = false;
      this.applyRedraw(position);
      setTimeout(() => {
        this.canRedraw = true;
      }, 100);
    }
  }

  setZoomFactor(zoomFactor: number): void {
      // Cap the values.
      zoomFactor = this.zoomService.capZoomValues(zoomFactor);

      // Adjust canvas sizes.
      const oldWidth = this.backgroundCanvas.displayCanvas.width;
      const oldHeight = this.backgroundCanvas.displayCanvas.height;
      const newWidth = this.fullCanvasWidth / zoomFactor;
      const newHeight = this.fullCanvasHeight / zoomFactor;
      this.backgroundCanvas.displayCanvas.width = newWidth;
      this.backgroundCanvas.displayCanvas.height = newHeight;
      this.layersService.resize(newWidth, newHeight);

      if (zoomFactor !== this.zoomService.ZOOM.MIN && zoomFactor !== this.zoomService.ZOOM.MAX) {
          this.zoomService.zoomFactor = zoomFactor;
          this.offsetX += (oldWidth - newWidth) / 2;
          this.offsetY += (oldHeight - newHeight) / 2;
      }
      this.adjustOffsets();
      this.transform();
      this.updateCanvasDisplayRatio();
  }

  // Function to translate the view in the editor.
  translate(deltaX: number, deltaY: number): void {
    this.offsetX += deltaX;
    this.offsetY += deltaY;
    this.adjustOffsets();
    this.transform();
  }

  // Resizes the canvases to the current window size.
  resize(): void {
    if (!this.backgroundCanvas || !this.backgroundCanvas.originalCanvas) {
      return;
    }
    const viewportRatio = this.viewPortService.viewportRatio();
    let H: number; let W: number;
    if (this.originalImageRatio() > viewportRatio) {
      W = this.backgroundCanvas.originalCanvas.width;
      H = W * (1 / viewportRatio);
    } else {
      H = this.backgroundCanvas.originalCanvas.height;
      W = H * viewportRatio;
    }
    const h = H / this.zoomService.zoomFactor;
    const w = W / this.zoomService.zoomFactor;

    // Resize main image.
    this.fullCanvasWidth = W;
    this.fullCanvasHeight = H;
    this.backgroundCanvas.displayCanvas.width = w;
    this.backgroundCanvas.displayCanvas.height = h;

    this.layersService.resize(w, h);  // Resize layers.
    this.adjustOffsets();             // Adjust the offsets so the image is in place.
    this.zoom(-100, new Point(0, 0)); // Call zoom to redraw everything.
  }

  // Load the main canvas.
  public loadMainCanvas(){
    const viewportRatio = this.viewPortService.viewportRatio();
    const imageRatio = this.originalImageRatio();
    if (imageRatio > viewportRatio) {
      this.fullCanvasWidth = this.backgroundCanvas.originalCanvas.width;
      this.fullCanvasHeight = this.fullCanvasWidth * (1 / viewportRatio);
    } else {
      this.fullCanvasHeight = this.backgroundCanvas.originalCanvas.height;
      this.fullCanvasWidth = this.fullCanvasHeight * viewportRatio;
    }
    this.backgroundCanvas.displayCanvas.width = this.fullCanvasWidth;
    this.backgroundCanvas.displayCanvas.height = this.fullCanvasHeight;
    const context: CanvasRenderingContext2D = this.backgroundCanvas.getDisplayContext();
    let x = 0, y = 0;
    if (imageRatio > viewportRatio) {
      y = (this.backgroundCanvas.displayCanvas.height - this.backgroundCanvas.originalCanvas.height) /2;
    } else {
      x = (this.backgroundCanvas.displayCanvas.width - this.backgroundCanvas.originalCanvas.width) / 2;
    }
    context.drawImage(
      this.backgroundCanvas.originalCanvas, x, y,
      this.backgroundCanvas.originalCanvas.width,
      this.backgroundCanvas.originalCanvas.height
    );
  }

  getMousePositionInCanvasSpace(clientPosition: Point): Point {
    let clientX: number;
    let clientY: number;
    clientX =
      this.scaleX === 1
        ? clientPosition.x - this.viewPortService.viewPort.getBoundingClientRect().left
        : this.viewPortService.viewPort.clientWidth -
          clientPosition.x +
          this.viewPortService.viewPort.getBoundingClientRect().left;

    clientY = clientPosition.y - this.viewPortService.viewPort.getBoundingClientRect().top;
    const canvasX =
      (clientX * this.backgroundCanvas.displayCanvas.width) /
      this.backgroundCanvas.displayCanvas.getBoundingClientRect().width;
    const canvasY =
      (clientY * this.backgroundCanvas.displayCanvas.height) /
      this.backgroundCanvas.displayCanvas.getBoundingClientRect().height;
    return new Point(canvasX, canvasY);
  }

  // Load the zoom canvas.
  // setTimeout 0 makes sure the imageLoaded boolean was changed in the cycle,
  //  Without this zoomCanvas is still undefined because of ngIf in template
  public loadZoomCanvas(): void{
    setTimeout(() => {
      const zoomCanvas: HTMLCanvasElement = document.getElementById('zoom-canvas') as HTMLCanvasElement;
      zoomCanvas.width = this.backgroundCanvas.originalCanvas.width;
      zoomCanvas.height = this.backgroundCanvas.originalCanvas.height;
      const zoomContext = zoomCanvas.getContext('2d');
      zoomContext.drawImage(this.backgroundCanvas.originalCanvas, 0, 0);
    }, 0);
  }
}
