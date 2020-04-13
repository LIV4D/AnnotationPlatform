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
import { LoadingService } from './Data-Persistence/loading.service';
import { SubmitService } from './Data-Persistence/submit.service';
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
  offsetY: number;
  mouseDown = false;
  scaleX: number;
  svgLoaded: EventEmitter<any>;
  menuState: boolean;

  commentBoxes: CommentBoxSingleton;


  // public biomarkersService: BiomarkersService,

  constructor(
    private http: HttpClient,
    public layersService: LayersService,
    public galleryService: GalleryService,
    public router: Router,
    public canvasDimensionService: CanvasDimensionService,
    private biomarkerService: BiomarkerService,
    private loadingService: LoadingService,
    private submitService: SubmitService,
  ) {
    this.scaleX = 1;
    this.loadingService.setImageLoaded(false);
    this.canvasDimensionService.canvasDisplayRatio = new BehaviorSubject<number>(1);
    this.commentBoxes = CommentBoxSingleton.getInstance();
    this.backgroundCanvas = this.canvasDimensionService.backgroundCanvas;

  }

  init(
    svgLoaded: EventEmitter<any>,
    viewPort: ElementRef,
    svgBox: ElementRef
  ): void {
    this.biomarkerService.dataSource = null;
    this.canvasDimensionService.zoomFactor = 1.0;
    this.canvasDimensionService.offsetX = 0;
    this.canvasDimensionService.offsetY = 0;
    this.loadingService.setImageLoaded(false);

    // this.viewPort = document.getElementById('editor-box') as HTMLDivElement;
    this.canvasDimensionService.viewPort = viewPort.nativeElement;
    // this.svgBox = document.getElementById('svg-box') as HTMLDivElement;
    this.submitService.svgBox = svgBox.nativeElement;

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
    this.canvasDimensionService.updateCanvasDisplayRatio();
  }

  // Resizes the canvases to the current window size.
  resize(): void {
    this.canvasDimensionService.resize();
  }

  // Load canvases and local variables when opening a local image.
  public async loadAllLocal(
    image: HTMLImageElement,
    svgLoaded: EventEmitter<any>
  ): Promise<void> {
    this.loadingService.setImageLoaded(true);
    this.canvasDimensionService.backgroundCanvas = new BackgroundCanvas(
      document.getElementById('main-canvas') as HTMLCanvasElement,
      this.loadingService.getImageLocal()
    );

    // Load the main canvas.
    const viewportRatio = this.viewportRatio();
    const imageRatio = this.originalImageRatio();

    if (imageRatio > viewportRatio) {
      this.canvasDimensionService.fullCanvasWidth = this.canvasDimensionService.backgroundCanvas.originalCanvas.width;
      this.canvasDimensionService.fullCanvasHeight = this.canvasDimensionService.fullCanvasWidth * (1 / viewportRatio);
    } else {
      this.canvasDimensionService.fullCanvasHeight = this.canvasDimensionService.backgroundCanvas.originalCanvas.height;
      this.canvasDimensionService.fullCanvasWidth = this.canvasDimensionService.fullCanvasHeight * viewportRatio;
    }

    this.canvasDimensionService.backgroundCanvas.displayCanvas.width = this.canvasDimensionService.fullCanvasWidth;
    this.canvasDimensionService.backgroundCanvas.displayCanvas.height = this.canvasDimensionService.fullCanvasHeight;
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
    this.loadingService.loadRevision(drawTheAnnotation);
  }

  // Load the main image in the background canvas.
  public loadMainImage(image: HTMLImageElement): void {
    this.loadingService.loadMainImage(image);
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
    this.loadingService.loadAll();
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

  // public loadSVGLocal(event: any): void {
  //   const reader: FileReader = new FileReader();
  //   reader.onload = () => {
  //     this.layersService.biomarkerCanvas = [];
  //     this.svgBox.innerHTML = reader.result as string;
  //     const parser = new DOMParser();
  //     const xmlDoc = parser.parseFromString(this.svgBox.innerHTML, 'text/xml');
  //     const arbre: SVGGElement[] = [];
  //     Array.from(xmlDoc.children).forEach((e: SVGGElement) => {
  //       const elems = e.getElementsByTagName('g');
  //       for (let j = 0; j < elems.length; j++) {
  //         if (elems[j].parentElement.tagName !== 'g') {
  //           arbre.push(elems[j]);
  //         }
  //       }
  //     });
  //     this.layersService.biomarkerCanvas = [];
  //     arbre.forEach((e: SVGGElement) => {
  //       this.layersService.createFlatCanvasRecursive(e);
  //     });
  //   };
  //   reader.readAsBinaryString(event.target.files[0]);
  //   this.localSVGName = event.target.files[0].name;
  // }

  // Function to update the zoom rectangle.
  // TODO: Move this to zoom.service.ts if it gets enough logic, otherwise keep here.
  updateZoomRect(): void {
    this.canvasDimensionService.updateZoomRect();
  }

  // Function to adjust the offsets to keep a coherent editor.
  // Returns true if an adjustment was made, false otherwise.
  adjustOffsets(): boolean {
    return this.canvasDimensionService.adjustOffsets();
  }

  testRedraw(position: Point) {
    this.canvasDimensionService.testRedraw(position);
  }

  // Function to zoom on a part of the image.
  // Currently only centered with specific ratios.
  zoom(delta: number, position: Point = null): void {
    this.canvasDimensionService.zoom(delta, position);
  }


  setZoomFactor(zoomFactor: number): void {
      // Cap the values.
      if (zoomFactor > 1) { zoomFactor = 1;
      } else if (zoomFactor < 0) { zoomFactor = 0; }
      zoomFactor = ZOOM.MAX * zoomFactor + ZOOM.MIN;

      // Adjust canvas sizes.
      const oldWidth = this.canvasDimensionService.backgroundCanvas.displayCanvas.width;
      const oldHeight = this.canvasDimensionService.backgroundCanvas.displayCanvas.height;
      const newWidth = this.canvasDimensionService.fullCanvasWidth / zoomFactor;
      const newHeight = this.canvasDimensionService.fullCanvasHeight / zoomFactor;
      this.canvasDimensionService.backgroundCanvas.displayCanvas.width = newWidth;
      this.canvasDimensionService.backgroundCanvas.displayCanvas.height = newHeight;
      this.layersService.resize(newWidth, newHeight);

      if (zoomFactor !== ZOOM.MIN && zoomFactor !== ZOOM.MAX) {
          this.canvasDimensionService.zoomFactor = zoomFactor;
          this.canvasDimensionService.offsetX += (oldWidth - newWidth) / 2;
          this.canvasDimensionService.offsetY += (oldHeight - newHeight) / 2;
      }
      this.adjustOffsets();
      this.transform();
      this.updateCanvasDisplayRatio();
  }

  // Function to translate the view in the editor.
  translate(deltaX: number, deltaY: number): void {
    this.canvasDimensionService.translate(deltaX, deltaY);
  }

  // Function to change the offsets to match a new center.
  moveCenter(percentX: number, percentY: number): void {
    this.canvasDimensionService.moveCenter(percentX, percentY);
  }

  // Function that transforms the editor view according to the zoomFactor and offsets properties.
  transform(): void {
    this.canvasDimensionService.transform();
  }

  // Return the width/height ratio of the viewport (displayed).
  viewportRatio(): number {
    return this.canvasDimensionService.viewportRatio();
  }

  // Return the width/height ratio of the original image.
  originalImageRatio(): number {
    return this.canvasDimensionService.originalImageRatio();
  }

  getMousePositionInCanvasSpace(clientPosition: Point): Point {
    let clientX: number;
    let clientY: number;
    clientX =
      this.scaleX === 1
        ? clientPosition.x - this.canvasDimensionService.viewPort.getBoundingClientRect().left
        : this.canvasDimensionService.viewPort.clientWidth -
          clientPosition.x +
          this.canvasDimensionService.viewPort.getBoundingClientRect().left;

    clientY = clientPosition.y - this.canvasDimensionService.viewPort.getBoundingClientRect().top;
    const canvasX =
      (clientX * this.canvasDimensionService.backgroundCanvas.displayCanvas.width) /
      this.canvasDimensionService.backgroundCanvas.displayCanvas.getBoundingClientRect().width;
    const canvasY =
      (clientY * this.canvasDimensionService.backgroundCanvas.displayCanvas.height) /
      this.canvasDimensionService.backgroundCanvas.displayCanvas.getBoundingClientRect().height;
    return new Point(canvasX, canvasY);
  }

  getMousePositionInDisplaySpace(clientPosition: Point): Point {
    const x = clientPosition.x - this.canvasDimensionService.viewPort.getBoundingClientRect().left;
    const y = clientPosition.y - this.canvasDimensionService.viewPort.getBoundingClientRect().top;

    return new Point(x, y);
  }

  loadMetadata(imageId: string): void {
    this.loadingService.loadMetadata(imageId);
  }

  saveSVGFile(): void {
    this.submitService.saveSVGFile()
  }

  cancel() {}

  setImageId(id: string): void {
    this.loadingService.setImageId(id);
  }
}
