import { Injectable, EventEmitter, ElementRef } from '@angular/core';
import { LayersService } from './layers.service';
import { Router } from '@angular/router';
import { BackgroundCanvas } from './Tools/background-canvas.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { GalleryService } from '../Gallery/gallery.service';
import { BiomarkerService } from './biomarker.service';

import { BehaviorSubject } from 'rxjs';
import { Point } from './Tools/point.service';

// Min and max values for zooming
const ZOOM = {
  MIN: 1.0,
  MAX: 16.0,
};

@Injectable({
  providedIn: 'root',
})
export class CanvasDimensionService {
  backgroundCanvas: BackgroundCanvas;
  viewPort: HTMLDivElement;
  canvasDisplayRatio: BehaviorSubject<number>;
  zoomFactor: number;
  fullCanvasWidth: number;
  fullCanvasHeight: number;
  offsetX: number;
  offsetY: number;
  canRedraw = true;

  constructor(
    public layersService: LayersService,
    public galleryService: GalleryService,
    public router: Router,
  ) {}

  // Return the width/height ratio of the viewport (displayed).
  viewportRatio(): number {
    return (
      this.viewPort.getBoundingClientRect().width /
      this.viewPort.getBoundingClientRect().height
    );
  }

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
    if (
      this.backgroundCanvas.originalCanvas.width >
      this.backgroundCanvas.displayCanvas.width
    ) {
      this.offsetX = Math.min(
        this.backgroundCanvas.originalCanvas.width -
          this.backgroundCanvas.displayCanvas.width,
        this.offsetX
      );
    } else {
      this.offsetX = 0;
    }

    if (
      this.backgroundCanvas.originalCanvas.height >
      this.backgroundCanvas.displayCanvas.height
    ) {
      this.offsetY = Math.min(
        this.backgroundCanvas.originalCanvas.height -
          this.backgroundCanvas.displayCanvas.height,
        this.offsetY
      );
    } else {
      this.offsetY = 0;
    }

    // Turn the offsets to integers to avoid problems with pixel math.
    this.offsetX = Math.floor(this.offsetX);
    this.offsetY = Math.floor(this.offsetY);

    return oldXOffset !== this.offsetX || oldYOffset !== this.offsetY;
  }

    // Function to update the zoom rectangle.
  // TODO: Move this to zoom.service.ts if it gets enough logic, otherwise keep here.
  updateZoomRect(): void {
    const zoomCanvas: HTMLCanvasElement = document.getElementById(
      'zoom-canvas'
    ) as HTMLCanvasElement;
    if (zoomCanvas !== null) {
      const zoomContext: CanvasRenderingContext2D = zoomCanvas.getContext('2d');

      // Clear the canvas to redraw the image and the rectangle.
      zoomContext.clearRect(0, 0, zoomCanvas.width, zoomCanvas.height);

      // Redraw the image.
      zoomContext.drawImage(this.backgroundCanvas.originalCanvas, 0, 0);

      // Redraw the rectangle (unless completely zoomed out).
      if (this.zoomFactor === 1.0) {
        return;
      }
      const realHeight = this.backgroundCanvas.displayCanvas.getBoundingClientRect()
        .height;
      const realWidth = this.backgroundCanvas.displayCanvas.getBoundingClientRect()
        .width;
      let h: number;
      let w: number;
      if (this.originalImageRatio() > this.viewportRatio()) {
        w = zoomCanvas.width / this.zoomFactor;
        h = Math.min(w * (realHeight / realWidth), zoomCanvas.height);
      } else {
        h = zoomCanvas.height / this.zoomFactor;
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

    //Redraw the zoom rectangle.
    this.updateZoomRect();
  }

  testRedraw(position: Point) {
    const zoomFactor = this.zoomFactor;

    // Adjust canvas sizes.
    const oldWidth = this.backgroundCanvas.displayCanvas.width;
    // divide by the zoom factor in order to get the new selection's width to zoom at
    const newWidth = this.fullCanvasWidth / zoomFactor;
    this.backgroundCanvas.displayCanvas.width = newWidth;

    const newHeight = this.fullCanvasHeight / zoomFactor;
    const oldHeight = this.backgroundCanvas.displayCanvas.height;
    this.backgroundCanvas.displayCanvas.height = newHeight;

     this.layersService.resize(newWidth, newHeight);

    if (zoomFactor !== ZOOM.MIN && zoomFactor !== ZOOM.MAX) {
       this.zoomFactor = zoomFactor;

      // Adjust offsets to keep them coherent with the previous zoom.
      let positionXPercentage = 0.5;
      let positionYPercentage = 0.5;

      if (position !== null) {

        // This is just to get a value 0 <= X <= 1 and 0 <= Y <= 1
        positionXPercentage = Math.min(Math.max(position.x / oldWidth, 0), 1);
        positionYPercentage = Math.min(Math.max(position.y / oldHeight, 0), 1);
        // console.log('%c positionXPercentage : ' + positionXPercentage , 'color: black; background:yellow;');
      }

      const deltaX = (oldWidth - newWidth) * positionXPercentage;
      // console.log('%c deltaX : ' + deltaX , 'color: black; background:red;');
      const deltaY = (oldHeight - newHeight) * positionYPercentage;
      // console.log('%c deltaY : ' + deltaY , 'color: black; background:red;');
      this.offsetX += deltaX;
      this.offsetY += deltaY;
    }

    this.adjustOffsets();
    this.transform();
    this.updateCanvasDisplayRatio();
  }

  // Function to zoom on a part of the image.
  // Currently only centered with specific ratios.
  zoom(delta: number, position: Point = null): void {
    // console.log('%c delta:  ' + delta , 'color: black; background:yellow;');

    // Keep zoom in range [100%, 600%]
    // exp is used for acceleration
    let zoomFactor = this.zoomFactor * Math.exp(delta);
    // let zoomFactor = this.zoomFactor * (2 / (1 + Math.exp(delta)));

    // Cap the values.
    if (zoomFactor > ZOOM.MAX) {
      zoomFactor = ZOOM.MAX;
    } else if (zoomFactor < ZOOM.MIN) {
      zoomFactor = ZOOM.MIN;
    }

    this.zoomFactor = zoomFactor;

    if (this.canRedraw) {
      this.canRedraw = false;
      this.testRedraw(position);
      // TODO: CSS translation here

      setTimeout(() => {
        this.canRedraw = true;
      }, 100);
    }
    // console.log('%c else ', 'color: black; background:blue;');

    // maybe to implement
    // return pointToTranslate;
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
    const viewportRatio = this.viewportRatio();
    let H: number;
    let W: number;
    if (this.originalImageRatio() > viewportRatio) {
      W = this.backgroundCanvas.originalCanvas.width;
      H = W * (1 / viewportRatio);
    } else {
      H = this.backgroundCanvas.originalCanvas.height;
      W = H * viewportRatio;
    }
    const h = H / this.zoomFactor;
    const w = W / this.zoomFactor;

    // Resize main image.
    this.fullCanvasWidth = W;
    this.fullCanvasHeight = H;
    this.backgroundCanvas.displayCanvas.width = w;
    this.backgroundCanvas.displayCanvas.height = h;

    // Resize layers.
    this.layersService.resize(w, h);

    // Adjust the offsets so the image is in place.
    this.adjustOffsets();

    // Call zoom to redraw everything.
    this.zoom(-100, new Point(0, 0));
  }
}
