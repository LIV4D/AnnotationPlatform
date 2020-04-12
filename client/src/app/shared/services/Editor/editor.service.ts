import { WidgetStorageService } from './Data-Persistence/widgetStorage.service';
import { Injectable, EventEmitter, ElementRef } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { LayersService } from './layers.service';
import { Router } from '@angular/router';
import { CanvasDimensionService } from './canvas-dimension.service';
import { BackgroundCanvas } from './Tools/background-canvas.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Point } from './Tools/point.service';
import { GalleryService } from '../Gallery/gallery.service';
import { BiomarkerService } from './biomarker.service';
import { CommentBoxSingleton } from '../../models/comment-box-singleton.model';
import { saveAs } from 'file-saver';
import { LoadingService } from './Data-Persistence/loading.service';
declare const Buffer;

// Min and max values for zooming
const ZOOM = {
  MIN: 1.0,
  MAX: 16.0,
};

const PREPROCESSING_TYPE = 1; // Eventually there could be more.

@Injectable({
  providedIn: 'root',
})
export class EditorService {
  backgroundCanvas: BackgroundCanvas;
  zoomFactor: number;
  offsetX: number;
  offsetY: number;
  viewPort: HTMLDivElement;
  mouseDown = false;
  svgBox: HTMLDivElement;
  imageLoaded: boolean;
  fullCanvasWidth: number;
  fullCanvasHeight: number;
  scaleX: number;
  canvasDisplayRatio: BehaviorSubject<number>;
  svgLoaded: EventEmitter<any>;
  localSVGName: string;
  menuState: boolean;

  canRedraw = true;
  commentBoxes: CommentBoxSingleton;


  // public biomarkersService: BiomarkersService,

  constructor(
    private http: HttpClient,
    public layersService: LayersService,
    public galleryService: GalleryService,
    public router: Router,
    private canvasDimensionService: CanvasDimensionService,
    private biomarkerService: BiomarkerService,
    private loadingService: LoadingService
  ) {
    this.scaleX = 1;
    this.imageLoaded = false;
    this.canvasDisplayRatio = new BehaviorSubject<number>(1);
    this.commentBoxes = CommentBoxSingleton.getInstance();
    this.backgroundCanvas = this.canvasDimensionService.backgroundCanvas;
  }

  init(
    svgLoaded: EventEmitter<any>,
    viewPort: ElementRef,
    svgBox: ElementRef
  ): void {
    this.biomarkerService.dataSource = null;
    this.zoomFactor = 1.0;
    this.offsetX = 0;
    this.offsetY = 0;
    this.imageLoaded = false;

    // this.viewPort = document.getElementById('editor-box') as HTMLDivElement;
    this.viewPort = viewPort.nativeElement;
    // this.svgBox = document.getElementById('svg-box') as HTMLDivElement;
    this.svgBox = svgBox.nativeElement;

    this.svgLoaded = svgLoaded;
    if (this.loadingService.getImageLocal()) {
      this.setImageId('local');
      this.loadAllLocal(this.loadingService.getImageLocal(), this.svgLoaded);
    } else {
      this.loadAll();
    }
    this.resize();
  }

  // Reads the current display canvas dimensions and update canvasDisplayRatio.
  updateCanvasDisplayRatio(): void {
    const ratio =
      this.canvasDimensionService.backgroundCanvas.displayCanvas.getBoundingClientRect().width /
      this.canvasDimensionService.backgroundCanvas.displayCanvas.width;
    this.canvasDisplayRatio.next(ratio);
  }

  // Resizes the canvases to the current window size.
  resize(): void {
    if (!this.canvasDimensionService.backgroundCanvas || !this.canvasDimensionService.backgroundCanvas.originalCanvas) {
      return;
    }
    const viewportRatio = this.viewportRatio();
    let H: number;
    let W: number;
    if (this.originalImageRatio() > viewportRatio) {
      W = this.canvasDimensionService.backgroundCanvas.originalCanvas.width;
      H = W * (1 / viewportRatio);
    } else {
      H = this.canvasDimensionService.backgroundCanvas.originalCanvas.height;
      W = H * viewportRatio;
    }
    const h = H / this.zoomFactor;
    const w = W / this.zoomFactor;

    // Resize main image.
    this.fullCanvasWidth = W;
    this.fullCanvasHeight = H;
    this.canvasDimensionService.backgroundCanvas.displayCanvas.width = w;
    this.canvasDimensionService.backgroundCanvas.displayCanvas.height = h;

    // Resize layers.
    this.layersService.resize(w, h);

    // Adjust the offsets so the image is in place.
    this.adjustOffsets();

    // Call zoom to redraw everything.
    this.zoom(-100, new Point(0, 0));
  }

  // Load canvases and local variables when opening a local image.
  public async loadAllLocal(
    image: HTMLImageElement,
    svgLoaded: EventEmitter<any>
  ): Promise<void> {
    // console.log("Load all local");
    this.imageLoaded = true;
    this.canvasDimensionService.backgroundCanvas = new BackgroundCanvas(
      document.getElementById('main-canvas') as HTMLCanvasElement,
      this.loadingService.getImageLocal()
    );

    // Load the main canvas.
    const viewportRatio = this.viewportRatio();
    const imageRatio = this.originalImageRatio();

    if (imageRatio > viewportRatio) {
      this.fullCanvasWidth = this.canvasDimensionService.backgroundCanvas.originalCanvas.width;
      this.fullCanvasHeight = this.fullCanvasWidth * (1 / viewportRatio);
    } else {
      this.fullCanvasHeight = this.canvasDimensionService.backgroundCanvas.originalCanvas.height;
      this.fullCanvasWidth = this.fullCanvasHeight * viewportRatio;
    }

    this.canvasDimensionService.backgroundCanvas.displayCanvas.width = this.fullCanvasWidth;
    this.canvasDimensionService.backgroundCanvas.displayCanvas.height = this.fullCanvasHeight;
    const context: CanvasRenderingContext2D = this.canvasDimensionService.backgroundCanvas.getDisplayContext();
    let x = 0;
    let y = 0;

    if (imageRatio > viewportRatio) {
      y =
        (this.canvasDimensionService.backgroundCanvas.displayCanvas.height -
          this.canvasDimensionService.backgroundCanvas.originalCanvas.height) /
        2;
    } else {
      x =
        (this.canvasDimensionService.backgroundCanvas.displayCanvas.width -
          this.canvasDimensionService.backgroundCanvas.originalCanvas.width) /
        2;
    }

    context.drawImage(
      this.canvasDimensionService.backgroundCanvas.originalCanvas,
      x,
      y,
      this.canvasDimensionService.backgroundCanvas.originalCanvas.width,
      this.canvasDimensionService.backgroundCanvas.originalCanvas.height
    );

    // Load the zoom canvas.
    // setTimeout 0 makes sure the imageLoaded boolean was changed in the cycle,
    // Without this zoomCanvas is still undefined because of ngIf in template
    setTimeout(() => {
      // We use setTimeout
      const zoomCanvas: HTMLCanvasElement = document.getElementById(
        'zoom-canvas'
      ) as HTMLCanvasElement;
      zoomCanvas.width = this.canvasDimensionService.backgroundCanvas.originalCanvas.width;
      zoomCanvas.height = this.canvasDimensionService.backgroundCanvas.originalCanvas.height;
      const zoomContext = zoomCanvas.getContext('2d');
      zoomContext.drawImage(this.canvasDimensionService.backgroundCanvas.originalCanvas, 0, 0);
    }, 0);
    this.updateCanvasDisplayRatio();

    // TODO: Gotta understand how to make this work with the server.
    // console.log('EMPTY');
    this.http
      .get(`/api/annotations/get/getEmpty/`, {
        headers: new HttpHeaders(),
      })
      .pipe()
      .subscribe((res:any) => {
        // Replace
        this.layersService.biomarkerCanvas = [];
        this.layersService.createFlatCanvasRecursiveJson(res.data, this.canvasDimensionService.backgroundCanvas.originalCanvas.width, this.canvasDimensionService.backgroundCanvas.originalCanvas.height);
        this.biomarkerService.initJsonRecursive(res.data);
      });

    const res = await this.http
      .get<any>(`/api/annotations/get/getEmpty/`, {
        headers: new HttpHeaders(),
        responseType: 'json',
      })
      .pipe()
      .toPromise();
  }

  // Loads a revision from the server. Draws that revision optionnaly.
  public async loadRevision(drawTheAnnotation: boolean): Promise<void> {
    this.loadingService.loadRevision(drawTheAnnotation, this.canvasDimensionService.backgroundCanvas.originalCanvas.width, this.canvasDimensionService.backgroundCanvas.originalCanvas.height);
  }

  // Load the main image in the background canvas.
  public loadMainImage(image: HTMLImageElement): void {
    this.canvasDimensionService.backgroundCanvas = new BackgroundCanvas(
      document.getElementById('main-canvas') as HTMLCanvasElement,
      image
    );
    // Load the main canvas.
    const viewportRatio = this.viewportRatio();
    const imageRatio = this.originalImageRatio();
    if (imageRatio > viewportRatio) {
      this.fullCanvasWidth = this.canvasDimensionService.backgroundCanvas.originalCanvas.width;
      this.fullCanvasHeight = this.fullCanvasWidth * (1 / viewportRatio);
    } else {
      this.fullCanvasHeight = this.canvasDimensionService.backgroundCanvas.originalCanvas.height;
      this.fullCanvasWidth = this.fullCanvasHeight * viewportRatio;
    }
    this.canvasDimensionService.backgroundCanvas.displayCanvas.width = this.fullCanvasWidth;
    this.canvasDimensionService.backgroundCanvas.displayCanvas.height = this.fullCanvasHeight;
    const context: CanvasRenderingContext2D = this.canvasDimensionService.backgroundCanvas.getDisplayContext();
    let x = 0,
      y = 0;
    if (imageRatio > viewportRatio) {
      y =
        (this.canvasDimensionService.backgroundCanvas.displayCanvas.height -
          this.canvasDimensionService.backgroundCanvas.originalCanvas.height) /
        2;
    } else {
      x =
        (this.canvasDimensionService.backgroundCanvas.displayCanvas.width -
          this.canvasDimensionService.backgroundCanvas.originalCanvas.width) /
        2;
    }
    context.drawImage(
      this.canvasDimensionService.backgroundCanvas.originalCanvas,
      x,
      y,
      this.canvasDimensionService.backgroundCanvas.originalCanvas.width,
      this.canvasDimensionService.backgroundCanvas.originalCanvas.height
    );
    // Load the zoom canvas.
    // setTimeout 0 makes sure the imageLoaded boolean was changed in the cycle,
    // Without this zoomCanvas is still undefined because of ngIf in template
    this.imageLoaded = true;
    setTimeout(() => {
      // We use setTimeout
      const zoomCanvas: HTMLCanvasElement = document.getElementById(
        'zoom-canvas'
      ) as HTMLCanvasElement;
      zoomCanvas.width = this.canvasDimensionService.backgroundCanvas.originalCanvas.width;
      zoomCanvas.height = this.canvasDimensionService.backgroundCanvas.originalCanvas.height;
      const zoomContext = zoomCanvas.getContext('2d');
      zoomContext.drawImage(this.canvasDimensionService.backgroundCanvas.originalCanvas, 0, 0);
      this.resize();
    }, 0);
    this.updateCanvasDisplayRatio();
  }

  getMainImage(): void {
    this.loadingService.getMainImage();
  }

  // Check if the browser's local storage contains a usable revision
  // that should be loaded.
  shouldLoadLocalStorage(lastImageId: string): boolean {
    return this.loadingService.shouldLoadLocalStorage(lastImageId);
  }

  // Load everything in the editor.
  public loadAll(): void {
    this.loadingService.loadAll(this.canvasDimensionService.backgroundCanvas.originalCanvas.width, this.canvasDimensionService.backgroundCanvas.originalCanvas.height);
  }

  // public loadPretreatmentImage(): void {
  //     const req = this.http.get(`/api/preprocessings/${this.imageId}/${PREPROCESSING_TYPE}`, { responseType: 'blob',
  //                                                                                              reportProgress: true,
  //                                                                                              observe: 'events' });
  //     this.headerService.display_progress(req, 'Downloading: Pre-Processing').subscribe(
  //         res => {
  //             const reader: FileReader = new FileReader();
  //             reader.onload = () => {
  //                 const image = new Image();
  //                 image.onload = () => {
  //                     this.backgroundCanvas.setPretreatmentImage(image);
  //                 };
  //                 image.src = reader.result as string;
  //             };
  //             reader.readAsDataURL(res);
  //         },
  //         err => {
  //             // // console.log('Error: ' + err);
  //         }
  //     );
  // }

  public loadSVGLocal(event: any): void {
    const reader: FileReader = new FileReader();
    reader.onload = () => {
      this.layersService.biomarkerCanvas = [];
      this.svgBox.innerHTML = reader.result as string;
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(this.svgBox.innerHTML, 'text/xml');
      const arbre: SVGGElement[] = [];
      Array.from(xmlDoc.children).forEach((e: SVGGElement) => {
        const elems = e.getElementsByTagName('g');
        for (let j = 0; j < elems.length; j++) {
          if (elems[j].parentElement.tagName !== 'g') {
            arbre.push(elems[j]);
          }
        }
      });
      this.layersService.biomarkerCanvas = [];
      arbre.forEach((e: SVGGElement) => {
        this.layersService.createFlatCanvasRecursive(e);
      });
    };
    reader.readAsBinaryString(event.target.files[0]);
    this.localSVGName = event.target.files[0].name;
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
      zoomContext.drawImage(this.canvasDimensionService.backgroundCanvas.originalCanvas, 0, 0);

      // Redraw the rectangle (unless completely zoomed out).
      if (this.zoomFactor === 1.0) {
        return;
      }
      const realHeight = this.canvasDimensionService.backgroundCanvas.displayCanvas.getBoundingClientRect()
        .height;
      const realWidth = this.canvasDimensionService.backgroundCanvas.displayCanvas.getBoundingClientRect()
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
      const x = (this.offsetX / this.canvasDimensionService.backgroundCanvas.displayCanvas.width) * w;
      const y = (this.offsetY / this.canvasDimensionService.backgroundCanvas.displayCanvas.height) * h;

      zoomContext.strokeStyle = 'white';
      zoomContext.lineWidth = 20;
      zoomContext.strokeRect(x, y, w, h);
    }
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
      this.canvasDimensionService.backgroundCanvas.originalCanvas.width >
      this.canvasDimensionService.backgroundCanvas.displayCanvas.width
    ) {
      this.offsetX = Math.min(
        this.canvasDimensionService.backgroundCanvas.originalCanvas.width -
          this.canvasDimensionService.backgroundCanvas.displayCanvas.width,
        this.offsetX
      );
    } else {
      this.offsetX = 0;
    }

    if (
      this.canvasDimensionService.backgroundCanvas.originalCanvas.height >
      this.canvasDimensionService.backgroundCanvas.displayCanvas.height
    ) {
      this.offsetY = Math.min(
        this.canvasDimensionService.backgroundCanvas.originalCanvas.height -
          this.canvasDimensionService.backgroundCanvas.displayCanvas.height,
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

  testRedraw(position: Point) {
    const zoomFactor = this.zoomFactor;

    // Adjust canvas sizes.
    const oldWidth = this.canvasDimensionService.backgroundCanvas.displayCanvas.width;
    // divide by the zoom factor in order to get the new selection's width to zoom at
    const newWidth = this.fullCanvasWidth / zoomFactor;
    // // console.log('%c newWidth : ' + newWidth , 'color: black; background:yellow;');
    this.canvasDimensionService.backgroundCanvas.displayCanvas.width = newWidth;

    const newHeight = this.fullCanvasHeight / zoomFactor;
    const oldHeight = this.canvasDimensionService.backgroundCanvas.displayCanvas.height;
    this.canvasDimensionService.backgroundCanvas.displayCanvas.height = newHeight;

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
    // console.log('%c zoomFactor:  ' + zoomFactor , 'color: white; background:black;');

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


  setZoomFactor(zoomFactor: number): void {
      // Cap the values.
      if (zoomFactor > 1) { zoomFactor = 1;
      } else if (zoomFactor < 0) { zoomFactor = 0; }
      zoomFactor = ZOOM.MAX * zoomFactor + ZOOM.MIN;

      // Adjust canvas sizes.
      const oldWidth = this.canvasDimensionService.backgroundCanvas.displayCanvas.width;
      const oldHeight = this.canvasDimensionService.backgroundCanvas.displayCanvas.height;
      const newWidth = this.fullCanvasWidth / zoomFactor;
      const newHeight = this.fullCanvasHeight / zoomFactor;
      this.canvasDimensionService.backgroundCanvas.displayCanvas.width = newWidth;
      this.canvasDimensionService.backgroundCanvas.displayCanvas.height = newHeight;
      this.layersService.resize(newWidth, newHeight);

      if (zoomFactor !== ZOOM.MIN && zoomFactor !== ZOOM.MAX) {
          this.zoomFactor = zoomFactor;
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

  // Function to change the offsets to match a new center.
  moveCenter(percentX: number, percentY: number): void {
    const displayW =
      this.canvasDimensionService.backgroundCanvas.displayCanvas.width <
      this.canvasDimensionService.backgroundCanvas.originalCanvas.width
        ? this.canvasDimensionService.backgroundCanvas.originalCanvas.width
        : this.canvasDimensionService.backgroundCanvas.displayCanvas.width;
    const displayH =
      this.canvasDimensionService.backgroundCanvas.displayCanvas.height <
      this.canvasDimensionService.backgroundCanvas.originalCanvas.height
        ? this.canvasDimensionService.backgroundCanvas.originalCanvas.height
        : this.canvasDimensionService.backgroundCanvas.displayCanvas.height;
    this.offsetX =
      this.canvasDimensionService.backgroundCanvas.originalCanvas.width * percentX - displayW / 2;
    this.offsetY =
      this.canvasDimensionService.backgroundCanvas.originalCanvas.height * percentY - displayH / 2;
    this.adjustOffsets();
    this.transform();
  }

  // Function that transforms the editor view according to the zoomFactor and offsets properties.
  transform(): void {
    if (!this.canvasDimensionService.backgroundCanvas || !this.canvasDimensionService.backgroundCanvas.originalCanvas) {
      return;
    }
    this.canvasDimensionService.backgroundCanvas.setOffset(this.offsetX, this.offsetY);

    this.canvasDimensionService.backgroundCanvas.draw();

    this.layersService.biomarkerCanvas.forEach(layer => {
      layer.setOffset(this.offsetX, this.offsetY);
      layer.draw();
    });

    //Redraw the zoom rectangle.
    this.updateZoomRect();
  }

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
      this.canvasDimensionService.backgroundCanvas.originalCanvas.width /
      this.canvasDimensionService.backgroundCanvas.originalCanvas.height
    );
  }

  getMousePositionInCanvasSpace(clientPosition: Point): Point {
    let clientX: number;
    let clientY: number;
    clientX =
      this.scaleX === 1
        ? clientPosition.x - this.viewPort.getBoundingClientRect().left
        : this.viewPort.clientWidth -
          clientPosition.x +
          this.viewPort.getBoundingClientRect().left;

    clientY = clientPosition.y - this.viewPort.getBoundingClientRect().top;
    const canvasX =
      (clientX * this.canvasDimensionService.backgroundCanvas.displayCanvas.width) /
      this.canvasDimensionService.backgroundCanvas.displayCanvas.getBoundingClientRect().width;
    const canvasY =
      (clientY * this.canvasDimensionService.backgroundCanvas.displayCanvas.height) /
      this.canvasDimensionService.backgroundCanvas.displayCanvas.getBoundingClientRect().height;
    return new Point(canvasX, canvasY);
  }

  getMousePositionInDisplaySpace(clientPosition: Point): Point {
    const x = clientPosition.x - this.viewPort.getBoundingClientRect().left;
    const y = clientPosition.y - this.viewPort.getBoundingClientRect().top;

    return new Point(x, y);
  }

  loadMetadata(imageId: string): void {
    this.loadingService.loadMetadata(imageId);
  }

  saveSVGFile(): void {
    if (!this.canvasDimensionService.backgroundCanvas || !this.canvasDimensionService.backgroundCanvas.originalCanvas) {
      return;
    }
    this.layersService.biomarkerCanvas.forEach((b) => {
      const elem = document.getElementById(b.id.replace('annotation-', ''));
      const url = b.currentCanvas.toDataURL();
      elem.setAttribute('width', '100%');
      elem.setAttribute('height', '100%');
      elem.setAttribute('xlink:href', url);
    });
    const header = '<?xml version="1.0" encoding="UTF-8"?>';
    const blob = new Blob(
      [header + this.svgBox.getElementsByTagName('svg')[0].outerHTML],
      { type: 'image/svg+xml' }
    );
    saveAs(blob, this.localSVGName);
  }

  cancel() {}

  setImageId(id: string): void {
    this.loadingService.setImageId(id);
  }
}
