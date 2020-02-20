import { Injectable } from '@angular/core';
import { AppService } from '../app.service';

@Injectable({
  providedIn: 'root'
})
export class LayersService {

  MAX_CAPACITY: number;

  appLayers: HTMLElement;
  biomarkerOverlayCanvas: HTMLCanvasElement;
  tempMaskCanvas: HTMLCanvasElement;
  tempDrawCanvas: HTMLCanvasElement;
  // biomarkerCanvas: BiomarkerCanvas[] = [];

  // undoStack: Stack<[number[], ImageData[]]>;
  // redoStack: Stack<[number[], ImageData[]]>;

  selectedBiomarkerId: string;

  // mousePositionInDisplayCoordinates: Point;
  // lastPoint: Point = null;
  firstPoint: HTMLElement = null;

  unsavedChange = false;

  constructor(private appService: AppService) { } // , private borderService: ImageBorderService

  init(): void {
    this.appLayers = document.getElementById('app-layers') as HTMLElement;
    this.biomarkerOverlayCanvas = document.createElement('canvas');
    this.biomarkerOverlayCanvas.id = 'biomarkerOverlay';
    this.setCanvasStyle(this.biomarkerOverlayCanvas);
    this.biomarkerOverlayCanvas.style.zIndex = '3';
    this.appLayers.appendChild(this.biomarkerOverlayCanvas);

    this.tempMaskCanvas = document.createElement('canvas');
    const maskCtx = this.tempMaskCanvas.getContext('2d');
    maskCtx.imageSmoothingEnabled = false;
    // maskCtx.mozImageSmoothingEnabled = false;
    // maskCtx.webkitImageSmoothingEnabled = false;

    this.tempDrawCanvas = document.createElement('canvas');
    const drawCtx = this.tempDrawCanvas.getContext('2d');
    drawCtx.imageSmoothingEnabled = false;
    // drawCtx.mozImageSmoothingEnabled = false;
    // drawCtx.webkitImageSmoothingEnabled = false;

    // this.MAX_CAPACITY = this.deviceService.isDesktop() ? 15 : 1;
    // TODO: THIS IS TEMPORARY
    this.MAX_CAPACITY = 15;

    // this.redoStack = new Stack<[number[], ImageData[]]>(this.MAX_CAPACITY);
    // this.undoStack = new Stack<[number[], ImageData[]]>(this.MAX_CAPACITY);
    // this.biomarkerCanvas = [];
  }

  public resize(width: number, height: number): void {
    // this.biomarkerCanvas.forEach(biomarker => {
    //     biomarker.displayCanvas.width = width;
    //     biomarker.displayCanvas.height = height;
    // });
    this.biomarkerOverlayCanvas.width = width;
    this.biomarkerOverlayCanvas.height = height;

    this.tempMaskCanvas.width = width;
    this.tempMaskCanvas.height = height;
    this.tempDrawCanvas.width = width;
    this.tempDrawCanvas.height =    height;
  }

  public setCanvasStyle(canvas: HTMLCanvasElement): void {
    canvas.style.height = '100%';
    canvas.style.width = '100%';
    canvas.style.backgroundColor = 'transparent';
    canvas.style.zIndex = '2';
    canvas.style.padding = '0';
    canvas.style.margin = 'auto';
    canvas.style.display = 'block';
    canvas.style.position = 'absolute';
    canvas.style.top = '0%';
    canvas.style.left = '0%';
    canvas.style.visibility = 'visible'; // important
    canvas.style.opacity = '0.65'; // important
    canvas.style['mix-blend-mode'] = 'color';

    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    // ctx.mozImageSmoothingEnabled = false;
    // ctx.webkitImageSmoothingEnabled = false;
  }

  createFlatCanvasRecursive(node: SVGGElement, width: number = 0, height: number = 0): void {
    if (node.tagName === 'image') {
        node.style.visibility = 'visible';
        const image = new Image();
        if (height !== 0 && width !== 0) {
            image.width = width;
            image.height = height;
        }
        image.onload = () => {
            // this.newBiomarker(image, node.id, node.getAttributeNS(null, 'color'));
        };
        if (!node.hasAttribute('xlink:href')) {
            // Add a transparent pixel to have a valid xlink:href
            node.setAttribute('xlink:href', 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=');
        }
        image.src = node.getAttribute('xlink:href');
    } else {
        Array.from(node.children).forEach((child: SVGGElement) => {
            child.style.visibility = 'visible';
            this.createFlatCanvasRecursive(child, width, height);
        });
    }
  }
}
