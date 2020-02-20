import { Injectable, EventEmitter } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { LayersService } from './layers.service';
import { Router } from '@angular/router';
import { BackgroundCanvas } from '../../models/background-canvas.model';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class EditorService {

  scaleX: number;
  imageId: string;
  imageLocal: HTMLImageElement;
  zoomFactor: number;
  offsetX: number;
  offsetY: number;
  viewPort: HTMLDivElement;
  svgBox: HTMLDivElement;
  imageLoaded: boolean;
  fullCanvasWidth: number;
  fullCanvasHeight: number;
  backgroundCanvas: BackgroundCanvas;
  svgLoaded: EventEmitter<any>;
  canvasDisplayRatio: BehaviorSubject<number>;

  constructor(private http: HttpClient, public layersService: LayersService, public router: Router) {

          this.scaleX = 1;
          this.imageLoaded = false;
          this.canvasDisplayRatio = new BehaviorSubject<number>(1);
          // Check if a change was made to save to localStorage every 30 seconds.
          // setInterval(() => {
          //     if (this.layersService.unsavedChange) {
          //         LocalStorage.save(this, this.layersService);
          //         this.layersService.unsavedChange = false;
          //     }
          // }, 30000);
   }

  // Resizes the canvases to the current window size.
  resize(): void {
    if (!this.backgroundCanvas || !this.backgroundCanvas.originalCanvas) { return; }
    const viewportRatio = this.viewportRatio();
    let H;
    let W;
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
    // this.zoom(-100, new Point(0, 0));
  }

  init(svgLoaded: EventEmitter<any>): void {
    // this.biomarkersService.dataSource = null;
    this.zoomFactor = 1.0;
    this.offsetX = 0;
    this.offsetY = 0;
    this.imageLoaded = false;
    this.viewPort = document.getElementById('editor-box') as HTMLDivElement;
    this.svgBox = document.getElementById('svg-box') as HTMLDivElement;
    this.svgLoaded = svgLoaded;

    if (this.imageLocal) {
        this.setImageId('local');
        this.loadAllLocal(this.imageLocal, this.svgLoaded);
    } else {
        this.loadAll();
    }
    this.resize();
  }

  // Load everything in the editor.
  public loadAll(): void {
    console.log('THIS IS BEING LOADED IN LOADALL()');

    // Check if a an image is saved in localStorage
    // const lastImageId = LocalStorage.lastSavedImageId();
    // if (this.shouldLoadLocalStorage(lastImageId)) {
    //     this.imageId = lastImageId;
    //     this.getMainImage();
    //     LocalStorage.load(this, this.layersService);
    //     this.loadRevision(false);
    //     this.loadMetadata(this.imageId);
    //     return;
    // }
    // // Check if imageId is set
    // if (!this.imageId) {
    //     return;
    // }
    // this.getMainImage();
    // this.loadRevision(true);
  }

  // Load canvases and local variables when opening a local image.
  public loadAllLocal(image: HTMLImageElement, svgLoaded: EventEmitter<any>): void {
    this.imageLoaded = true;
    this.backgroundCanvas = new BackgroundCanvas(
        document.getElementById('main-canvas') as HTMLCanvasElement,
        this.imageLocal
    );
    // Load the main canvas.
    const viewportRatio = this.viewportRatio();
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
    let x = 0;
    let y = 0;
    if (imageRatio > viewportRatio) {
        y = (this.backgroundCanvas.displayCanvas.height - this.backgroundCanvas.originalCanvas.height) / 2;
    } else {
        x = (this.backgroundCanvas.displayCanvas.width - this.backgroundCanvas.originalCanvas.width) / 2;
    }
    context.drawImage(
        this.backgroundCanvas.originalCanvas,
        x,
        y,
        this.backgroundCanvas.originalCanvas.width,
        this.backgroundCanvas.originalCanvas.height
    );
    // Load the zoom canvas.
    // setTimeout 0 makes sure the imageLoaded boolean was changed in the cycle,
    // Without this zoomCanvas is still undefined because of ngIf in template
    setTimeout(() => {
        // We use setTimeout
        const zoomCanvas: HTMLCanvasElement = document.getElementById('zoom-canvas') as HTMLCanvasElement;
        zoomCanvas.width = this.backgroundCanvas.originalCanvas.width;
        zoomCanvas.height = this.backgroundCanvas.originalCanvas.height;
        const zoomContext = zoomCanvas.getContext('2d');
        zoomContext.drawImage(this.backgroundCanvas.originalCanvas, 0, 0);
    }, 0);
    this.updateCanvasDisplayRatio();
    // this.http.get(`/api/revisions/emptyRevision/${this.galleryService.selected.id}`,
    //     { headers: new HttpHeaders(), responseType: 'json' }).pipe(
    //     ).subscribe(
    //     res => {
    //         // this.layersService.biomarkerCanvas = [];
    //         this.svgBox.innerHTML = (res as any).svg;
    //         const parser = new DOMParser();
    //         const xmlDoc = parser.parseFromString((res as any).svg, 'image/svg+xml');
    //         const arbre: SVGGElement[] = [];
    //         Array.from(xmlDoc.children).forEach((e: SVGGElement) => {
    //             const elems = e.getElementsByTagName('g');
    //             for (let j = 0; j < elems.length; j++) {
    //                 if (elems[j].parentElement.tagName !== 'g') {
    //                     arbre.push(elems[j]);
    //                 }
    //             }
    //         });
    //         arbre.forEach((e: SVGGElement) => {
    //             this.layersService.createFlatCanvasRecursive(e,
    //                 this.backgroundCanvas.originalCanvas.width,
    //                 this.backgroundCanvas.originalCanvas.height);
    //         });
    //         this.svgLoaded.emit(arbre);
    //     });
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
        this.offsetX = Math.min(this.backgroundCanvas.originalCanvas.width - this.backgroundCanvas.displayCanvas.width, this.offsetX);
    } else {
        this.offsetX = 0;
    }
    if (this.backgroundCanvas.originalCanvas.height > this.backgroundCanvas.displayCanvas.height) {
        this.offsetY = Math.min(this.backgroundCanvas.originalCanvas.height - this.backgroundCanvas.displayCanvas.height, this.offsetY);
    } else {
        this.offsetY = 0;
    }

    // Turn the offsets to integers to avoid problems with pixel math.
    this.offsetX = Math.floor(this.offsetX);
    this.offsetY = Math.floor(this.offsetY);

    return oldXOffset !== this.offsetX || oldYOffset !== this.offsetY;
  }

  // Reads the current display canvas dimensions and update canvasDisplayRatio.
  updateCanvasDisplayRatio(): void {
    const ratio = this.backgroundCanvas.displayCanvas.getBoundingClientRect().width /
        this.backgroundCanvas.displayCanvas.width;
    this.canvasDisplayRatio.next(ratio);
  }

  // Return the width/height ratio of the viewport (displayed).
  viewportRatio(): number {
    return this.viewPort.getBoundingClientRect().width / this.viewPort.getBoundingClientRect().height;
  }

  // Return the width/height ratio of the original image.
  originalImageRatio(): number {
    return this.backgroundCanvas.originalCanvas.width / this.backgroundCanvas.originalCanvas.height;
  }

  setImageId(id: string): void {
    this.imageId = id;
  }
}
