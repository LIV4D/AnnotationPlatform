import { Injectable } from '@angular/core';
import { AppService } from '../app.service';
import { BiomarkerCanvas } from '../../models/biomarker-canvas.model';
import { Point } from '../../models/point.model';
import { ImageBorderService } from './image-border.service';
export const ANNOTATION_PREFIX = 'annotation-';


@Injectable({
  providedIn: 'root'
})
export class LayersService {
  MAX_CAPACITY: number;

  appLayers: HTMLElement;
  biomarkerOverlayCanvas: HTMLCanvasElement;
  tempMaskCanvas: HTMLCanvasElement;
  tempDrawCanvas: HTMLCanvasElement;
  biomarkerCanvas: BiomarkerCanvas[] = [];

  // undoStack: Stack<[number[], ImageData[]]>;
  // redoStack: Stack<[number[], ImageData[]]>;

  selectedBiomarkerId: string;

  mousePositionInDisplayCoordinates: Point;
  lastPoint: Point = null;
  firstPoint: HTMLElement = null;

  unsavedChange = false;

  // private deviceService: DeviceDetectorService, , private borderService: ImageBorderService
  constructor(private appService: AppService, private imageBorderService: ImageBorderService) { }

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

    this.tempDrawCanvas = document.createElement('canvas');
    const drawCtx = this.tempDrawCanvas.getContext('2d');
    drawCtx.imageSmoothingEnabled = false;

    // this.MAX_CAPACITY = this.deviceService.isDesktop() ? 15 : 1;
    this.MAX_CAPACITY = 15;
    // this.redoStack = new Stack<[number[], ImageData[]]>(this.MAX_CAPACITY);
    // this.undoStack = new Stack<[number[], ImageData[]]>(this.MAX_CAPACITY);
    this.biomarkerCanvas = [];
  }

  // undo(): void {
  //     if (this.undoStack.getLength() > 0) {
  //         this.unsavedChange = true;
  //         const canvas = this.undoStack.pop();
  //         const imageDatas = new Array<ImageData>();

  //         canvas[0].forEach( (canvasIndex, arrayIndex) => {
  //             const biomarker = this.biomarkerCanvas[canvasIndex];
  //             imageDatas.push(biomarker.getCurrentImageData());
  //             biomarker.putImageData(canvas[1][arrayIndex], 0, 0);
  //             biomarker.draw();
  //         });

  //         this.redoStack.push([canvas[0], imageDatas]);
  //     }
  // }

  // redo(): void {
  //     if (this.redoStack.getLength() > 0) {
  //         this.unsavedChange = true;
  //         const canvas = this.redoStack.pop();
  //         const imageDatas = new Array<ImageData>();

  //         canvas[0].forEach( (canvasIndex, arrayIndex) => {
  //             const biomarker = this.biomarkerCanvas[canvasIndex];
  //             imageDatas.push(biomarker.getCurrentImageData());

  //             biomarker.putImageData(canvas[1][arrayIndex], 0, 0);
  //             biomarker.draw();
  //         });
  //         this.undoStack.push([canvas[0], imageDatas]);
  //     }
  // }

  // addToUndoStack(biomarkerCanvas: BiomarkerCanvas[]): void {
  //     this.unsavedChange = true;
  //     const indices = new Array<number>();
  //     const imageDatas = new Array<ImageData>();
  //     biomarkerCanvas.forEach((b) => {
  //         indices.push(b.index);
  //         imageDatas.push(b.getCurrentImageData());
  //     });
  //     this.undoStack.push([
  //         indices,
  //         imageDatas
  //     ]);
  //     this.redoStack.clear();
  // }

  // popUndoStack(): void {
  //     this.undoStack.pop();
  // }

  newBiomarker(image: HTMLImageElement, id: string, color: string): void {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    const viewport: HTMLElement = document.getElementById('editor-box');
    const canvasRatio = viewport.getBoundingClientRect().width / viewport.getBoundingClientRect().height;
    const imageRatio = image.width / image.height;
    if (imageRatio > canvasRatio) {
      canvas.width = image.width;
      canvas.height = canvas.width / (1 / canvasRatio);
    } else {
      canvas.height = image.height;
      canvas.width = canvas.height * canvasRatio;
    }
    this.setCanvasStyle(canvas);
    // Remove some of this...
    let x = 0;
    let y = 0;
    if (imageRatio > canvasRatio) {
      y = (canvas.height - image.height) / 2;
    } else {
      x = (canvas.width - image.width) / 2;
    }
    context.drawImage(image, x, y, image.width, image.height);
    canvas.id = ANNOTATION_PREFIX + id;
    this.appLayers.appendChild(canvas);
    this.biomarkerCanvas.push(
      new BiomarkerCanvas(canvas, image, ANNOTATION_PREFIX + id, color, this.biomarkerCanvas.length, this.imageBorderService)
    );
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
        this.newBiomarker(image, node.id, node.getAttributeNS(null, 'color'));
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
  }

  public getCurrentBiomarkerCanvas(): BiomarkerCanvas {
    // console.log(this.selectedBiomarkerId);
    const currentBiomarkerCanvas = this.getBiomarkerCanvasById(this.selectedBiomarkerId);
    if (currentBiomarkerCanvas == null) {
      console.log(this.selectedBiomarkerId, this.biomarkerCanvas);
    }
    return currentBiomarkerCanvas.isVisible() ? currentBiomarkerCanvas : null;
  }

  public getBiomarkerCanvas(): BiomarkerCanvas[] {
    return this.biomarkerCanvas.filter(element => element.isVisible());
  }

  public resetBiomarkerCanvas(ids: Array<string>): void {
      // this.addToUndoStack(ids.map(id => this.getBiomarkerCanvasById(id)));
      ids.forEach(id => {
          const biomarker = this.getBiomarkerCanvasById(id);
          biomarker.reset();
          biomarker.draw();
      });
  }

  public getBiomarkerCanvasById(id: string): BiomarkerCanvas {
    const result = this.biomarkerCanvas.find((b) => {
      return (b.id === ANNOTATION_PREFIX + id);
    });
    return result;
  }

  get biomarkerOverlayContext(): CanvasRenderingContext2D {
      return this.biomarkerOverlayCanvas.getContext('2d');
  }

  toggleBorders(showBorders: boolean): void {
      this.appService.loading = true;
      this.biomarkerCanvas.forEach((b) => {
          if (showBorders) {
              this.imageBorderService.erode(b.borderCanvas, b.currentCanvas);
          }
          b.drawBorders = showBorders;
          b.draw();
      });
      this.appService.loading = false;
  }

  toggleShadows(showShadows: boolean): void {
      this.appService.loading = true;
      this.biomarkerCanvas.forEach((b) => {
          b.drawShadows = showShadows;
          b.draw();
      });
      this.appService.loading = false;
  }

  public resize(width: number, height: number): void {
    this.biomarkerCanvas.forEach(biomarker => {
      biomarker.displayCanvas.width = width;
      biomarker.displayCanvas.height = height;
    });
    // console.log('width');
    // console.log(this.biomarkerOverlayCanvas.width);
    // console.log('height');
    // console.log(this.biomarkerOverlayCanvas.height);
    this.biomarkerOverlayCanvas.width = width;
    this.biomarkerOverlayCanvas.height = height;

    this.tempMaskCanvas.width = width;
    this.tempMaskCanvas.height = height;
    this.tempDrawCanvas.width = width;
    this.tempDrawCanvas.height = height;
  }

  // Add a point on the canvas to indicate the first point
  public addFirstPoint(): void {
      this.firstPoint = document.getElementById('firstPoint') as HTMLElement;
      this.lastPoint = new Point(this.mousePositionInDisplayCoordinates.x, this.mousePositionInDisplayCoordinates.y);
      this.firstPoint.setAttribute('cx', this.lastPoint.x.toString());
      this.firstPoint.setAttribute('cy', this.lastPoint.y.toString());
  }

  public updateDashStroke(): void {
      const dashStroke = document.getElementById('dashStroke') as HTMLElement;

      dashStroke.setAttribute('x1', this.mousePositionInDisplayCoordinates.x.toString());
      dashStroke.setAttribute('y1', this.mousePositionInDisplayCoordinates.y.toString());
      dashStroke.setAttribute('x2', this.lastPoint.x.toString());
      dashStroke.setAttribute('y2', this.lastPoint.y.toString());
  }

  public removeFirstPoint(): void {
      this.lastPoint = null;
      this.firstPoint.setAttribute('cx', '-10');
      this.firstPoint.setAttribute('cy', '-10');
      this.firstPoint = null;

      const dashStroke = document.getElementById('dashStroke') as HTMLElement;
      dashStroke.setAttribute('x1', '-10');
      dashStroke.setAttribute('y1', '-10');
      dashStroke.setAttribute('x2', '-10');
      dashStroke.setAttribute('y2', '-10');
  }

  public nearFirstPoint(): void {
      this.firstPoint.setAttribute('fill', 'white');
  }

  public farFirstPoint(): void {
      this.firstPoint.setAttribute('fill', 'grey');
  }
}
