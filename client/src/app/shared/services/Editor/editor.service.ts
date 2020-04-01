import { Injectable, EventEmitter, ElementRef } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { LayersService } from './layers.service';
import { Router } from '@angular/router';
import { BackgroundCanvas } from './Tools/background-canvas.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { LocalStorage } from './local-storage.service';
import { Point } from './Tools/point.service';
import { Image as ImageServer } from '../../models/serverModels/image.model';
import { tap } from 'rxjs/operators';
import { AppService } from '../app.service';
import { HeaderService } from '../header.service';
import { GalleryService } from '../Gallery/gallery.service';
import { BiomarkerService } from './biomarker.service';
import { CommentBoxSingleton } from '../../models/comment-box-singleton.model';
import { BioNode } from './../../models/bionode.model';
import { saveAs } from 'file-saver';
import { Task } from '../../models/serverModels/task.model';
import { AnnotationData } from '../../models/serverModels/annotationData.model';
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
  imageLocal: HTMLImageElement;
  imageServer: ImageServer;
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
  backgroundCanvas: BackgroundCanvas;
  canvasDisplayRatio: BehaviorSubject<number>;
  imageId: string;
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
    private appService: AppService,
    private headerService: HeaderService,
    private biomarkerService: BiomarkerService
  ) {
    this.scaleX = 1;
    this.imageLoaded = false;
    this.canvasDisplayRatio = new BehaviorSubject<number>(1);
    this.commentBoxes = CommentBoxSingleton.getInstance();
    // Check if a change was made to save to localStorage every 30 seconds.
    setInterval(() => {
      console.log(this.commentBoxes.getTextAreaValues());
      if (this.layersService.unsavedChange) {
        LocalStorage.save(this, this.layersService);
        this.layersService.unsavedChange = false;
      }
    }, 30000);
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
    if (this.imageLocal) {
      this.setImageId('local');
      this.loadAllLocal(this.imageLocal, this.svgLoaded);
    } else {
      this.loadAll();
    }
    this.resize();
  }

  // Reads the current display canvas dimensions and update canvasDisplayRatio.
  updateCanvasDisplayRatio(): void {
    const ratio =
      this.backgroundCanvas.displayCanvas.getBoundingClientRect().width /
      this.backgroundCanvas.displayCanvas.width;
    this.canvasDisplayRatio.next(ratio);
  }

  // Resizes the canvases to the current window size.
  resize(): void {
    // console.log('EditorService::resize()');
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

  // Load canvases and local variables when opening a local image.
  public async loadAllLocal(
    image: HTMLImageElement,
    svgLoaded: EventEmitter<any>
  ): Promise<void> {
    // console.log("Load all local");
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
      y =
        (this.backgroundCanvas.displayCanvas.height -
          this.backgroundCanvas.originalCanvas.height) /
        2;
    } else {
      x =
        (this.backgroundCanvas.displayCanvas.width -
          this.backgroundCanvas.originalCanvas.width) /
        2;
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
      const zoomCanvas: HTMLCanvasElement = document.getElementById(
        'zoom-canvas'
      ) as HTMLCanvasElement;
      zoomCanvas.width = this.backgroundCanvas.originalCanvas.width;
      zoomCanvas.height = this.backgroundCanvas.originalCanvas.height;
      const zoomContext = zoomCanvas.getContext('2d');
      zoomContext.drawImage(this.backgroundCanvas.originalCanvas, 0, 0);
    }, 0);
    this.updateCanvasDisplayRatio();

    // TODO: Gotta understand how to make this work with the server.
    // console.log('EMPTY');
    this.http
      .get(`/api/annotations/getEmpty/`, {
        headers: new HttpHeaders(),
        responseType: 'json',
      })
      .pipe()
      .subscribe((res) => {
        // Replace
        this.layersService.biomarkerCanvas = [];
        this.layersService.createFlatCanvasRecursiveJson(res); //
        this.biomarkerService.initJsonRecursive(res);
        // this.biomarkerService.buildTree(res as BioNode[]);

        // this.svgBox.innerHTML = (res as any).svg;
        // const parser = new DOMParser();
        // const xmlDoc = parser.parseFromString((res as any).svg, 'image/svg+xml');
        // const arbre: SVGGElement[] = [];
        // Array.from(xmlDoc.children).forEach((e: SVGGElement) => {
        //     const elems = e.getElementsByTagName('g');
        //     for (let j = 0; j < elems.length; j++) {
        //         if (elems[j].parentElement.tagName !== 'g') {
        //             arbre.push(elems[j]);
        //         }
        //     }
        // });
        // arbre.forEach((e: SVGGElement) => {
        //     this.layersService.createFlatCanvasRecursive(e,
        //         this.backgroundCanvas.originalCanvas.width,
        //         this.backgroundCanvas.originalCanvas.height);
        // });
        // this.svgLoaded.emit(arbre);
      });

    const res = await this.http
      .get<any>(`/api/annotations/getEmpty/`, {
        headers: new HttpHeaders(),
        responseType: 'json',
      })
      .pipe()
      .toPromise();

    console.log(JSON.parse(res));
  }

  // Loads a revision from the server. Draws that revision optionnaly.
  public async loadRevision(draw: boolean): Promise<void> {
    const userId = JSON.parse(localStorage.getItem('currentUser')).user.id;
    const req = this.http.get('/api/annotations/get/1', {
      headers: new HttpHeaders(),
      reportProgress: true,
      observe: 'events',
    });

    this.headerService
      .display_progress(req, 'Downloading Preannotations')
      .subscribe(
        (res) => {
          this.svgBox.innerHTML = res.svg;
          const parser = new DOMParser();
          const xmlDoc = parser.parseFromString(res.svg, 'image/svg+xml');
          const arbre: SVGGElement[] = [];
          Array.from(xmlDoc.children).forEach((e: SVGGElement) => {
            const elems = e.getElementsByTagName('g');
            for (let j = 0; j < elems.length; j++) {
              if (elems[j].parentElement.tagName !== 'g') {
                arbre.push(elems[j]);
              }
            }
          });

          // this.commentService.comment = res.diagnostic;

          if (draw) {
            this.layersService.biomarkerCanvas = [];
            arbre.forEach((e: SVGGElement) => {
              this.layersService.createFlatCanvasRecursive(e);
            });

            setTimeout(() => {
              LocalStorage.save(this, this.layersService);
            }, 1000);
          }
          this.svgLoaded.emit(arbre);
        },
        async (error) => {
          // const res = await this.http.get<any>(`/api/annotations/getEmpty/`,
          // { headers: new HttpHeaders(), responseType: 'json' }).pipe(
          // ).toPromise();
          // console.log(res);
          if (error.status === 404 || error.status === 500) {
            const reqBase = this.http.get(`/api/annotations/getEmpty/`, {
              headers: new HttpHeaders(),
              observe: 'events',
              reportProgress: true,
            });
            this.headerService
              .display_progress(reqBase, 'Downloading Preannotations')
              .subscribe((res) => {
                this.layersService.createFlatCanvasRecursiveJson(res);
                this.biomarkerService.initJsonRecursive(res);
                this.biomarkerService.buildTreeRecursive(res);

                // this.svgBox.innerHTML = (res as any).svg;
                // console.log(this.svgBox.innerHTML);
                // const parser = new DOMParser();
                // const xmlDoc = parser.parseFromString((res as any).svg, 'image/svg+xml');
                // console.log(xmlDoc)
                // const arbre: SVGGElement[] = [];
                // console.log(xmlDoc.children)
                // Array.from(xmlDoc.children).forEach((e: SVGGElement) => {
                //     const elems = e.getElementsByTagName('g');
                //     console.log(elems)
                //     for (let j = 0; j < elems.length; j++) {
                //         if (elems[j].parentElement.tagName !== 'g') {
                //             arbre.push(elems[j]);
                //             console.log(elems[j]);
                //         }
                //     }
                // });
                // // this.biomarkerService.init(arbre);
                // // this.commentService.comment = (res as any).diagnostic;
                // if (draw) {
                //     this.biomarkerService.init(arbre);
                //     this.layersService.biomarkerCanvas = [];
                //     arbre.forEach((e: SVGGElement) => {
                //         this.layersService.createFlatCanvasRecursive(e);
                //     });
                //     setTimeout(() => { LocalStorage.save(this, this.layersService); }, 1000);
                // }
                // this.svgLoaded.emit(arbre);
              });
          }
          // console.log('Loaded : ')
          // console.log(this.biomarkerService.lastBiomarkers)
          // console.log(this.layersService.biomarkerCanvas)
        }
      );
  }

  // Load the main image in the background canvas.
  public loadMainImage(image: HTMLImageElement): void {
    // console.log('EditorService::loadMainImage()');

    this.backgroundCanvas = new BackgroundCanvas(
      document.getElementById('main-canvas') as HTMLCanvasElement,
      image
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
    let x = 0,
      y = 0;
    if (imageRatio > viewportRatio) {
      y =
        (this.backgroundCanvas.displayCanvas.height -
          this.backgroundCanvas.originalCanvas.height) /
        2;
    } else {
      x =
        (this.backgroundCanvas.displayCanvas.width -
          this.backgroundCanvas.originalCanvas.width) /
        2;
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
    this.imageLoaded = true;
    setTimeout(() => {
      // We use setTimeout
      const zoomCanvas: HTMLCanvasElement = document.getElementById(
        'zoom-canvas'
      ) as HTMLCanvasElement;
      zoomCanvas.width = this.backgroundCanvas.originalCanvas.width;
      zoomCanvas.height = this.backgroundCanvas.originalCanvas.height;
      const zoomContext = zoomCanvas.getContext('2d');
      zoomContext.drawImage(this.backgroundCanvas.originalCanvas, 0, 0);
      this.resize();
    }, 0);
    this.updateCanvasDisplayRatio();
  }

  getMainImage(): void {
    // console.log('EditorService::getMainImage()');

    // '/api/images/download/:imageId/raw'
    // const req = this.http.get(`/api/images/${this.imageId}/getFile`, { responseType: 'blob', observe: 'events', reportProgress: true });

    const req = this.http.get(`/api/images/download/${this.imageId}/raw`, {
      responseType: 'blob',
      observe: 'events',
      reportProgress: true,
    });

    this.headerService
      .display_progress(req, 'Downloading: Image')
      .subscribe((res) => {
        const reader: FileReader = new FileReader();
        reader.onload = () => {
          const image = new Image();
          image.onload = () => {
            // console.log('image.onload()' + image);

            this.loadMainImage(image);
            // this.loadPretreatmentImage();
          };
          image.src = reader.result as string;
        };
        reader.readAsDataURL(res);
      });
  }

  // Check if the browser's local storage contains a usable revision
  // that should be loaded.
  shouldLoadLocalStorage(lastImageId: string): boolean {
    return (
      lastImageId && // Load if there is an imageId in the localStorage...
      (!this.imageId || // ... and there is no currently selected imageId ... // .. or that selected image is the same one as localStorage and
        //    not a local file system image
        (this.imageId === lastImageId && this.imageId !== 'local'))
    );
  }

  // Load everything in the editor.
  public loadAll(): void {
    // Check if a an image is saved in localStorage
    const lastImageId = LocalStorage.lastSavedImageId();

    if (this.shouldLoadLocalStorage(lastImageId)) {
      this.imageId = lastImageId;
      this.getMainImage();
      LocalStorage.load(this, this.layersService);
      this.loadRevision(true);
      LocalStorage.load(this, this.layersService);
      this.loadMetadata(this.imageId);
      return;
    }
    // Check if imageId is set
    if (!this.imageId) {
      return;
    }

    this.getMainImage();
    this.loadRevision(true);
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

  testRedraw(position: Point) {
    // console.log('%c testRedraw() ', 'color: black; background:red;');
    const zoomFactor = this.zoomFactor;

    // Adjust canvas sizes.
    const oldWidth = this.backgroundCanvas.displayCanvas.width;
    // // console.log('%c oldWidth : ' + oldWidth , 'color: black; background:yellow;');
    // // console.log('%c this.fullCanvasWidth : ' + this.fullCanvasWidth , 'color: black; background:red;');
    // // console.log('%c zoomFactor : ' + zoomFactor , 'color: black; background:yellow;');
    // divide by the zoom factor in order to get the new selection's width to zoom at
    const newWidth = this.fullCanvasWidth / zoomFactor;
    // // console.log('%c newWidth : ' + newWidth , 'color: black; background:yellow;');
    this.backgroundCanvas.displayCanvas.width = newWidth;

    const newHeight = this.fullCanvasHeight / zoomFactor;
    const oldHeight = this.backgroundCanvas.displayCanvas.height;
    this.backgroundCanvas.displayCanvas.height = newHeight;

    // this.layersService.resize(newWidth, newHeight);

    if (zoomFactor !== ZOOM.MIN && zoomFactor !== ZOOM.MAX) {
      // this.zoomFactor = zoomFactor;

      // Adjust offsets to keep them coherent with the previous zoom.
      let positionXPercentage = 0.5;
      let positionYPercentage = 0.5;

      if (position !== null) {
        // console.log('%c position.x : ' + position.x , 'color: black; background:red;');
        // console.log('%c oldWidth : ' + oldWidth , 'color: black; background:red;');

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
    // this.updateCanvasDisplayRatio();
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
      // do CSS translation here
      // const imgg = new Image();
      // imgg.src = '../../assets/Screenshot 2020-03-05 12.02.17.png';
      // this.backgroundCanvas.currentCanvas.getContext('2d').drawImage(imgg, 0, 0);

      setTimeout(() => {
        this.canRedraw = true;
      }, 100);
    }
    // console.log('%c else ', 'color: black; background:blue;');

    // maybe to implement
    // return pointToTranslate;
  }

  // this only works for zoom slider (when using mobile device)
  // setZoomFactor(zoomFactor: number): void {
  //     // Cap the values.
  //     if (zoomFactor > 1) { zoomFactor = 1;
  //     } else if (zoomFactor < 0) { zoomFactor = 0; }
  //     zoomFactor = ZOOM.MAX * zoomFactor + ZOOM.MIN;

  //     // Adjust canvas sizes.
  //     const oldWidth = this.backgroundCanvas.displayCanvas.width;
  //     const oldHeight = this.backgroundCanvas.displayCanvas.height;
  //     const newWidth = this.fullCanvasWidth / zoomFactor;
  //     const newHeight = this.fullCanvasHeight / zoomFactor;
  //     this.backgroundCanvas.displayCanvas.width = newWidth;
  //     this.backgroundCanvas.displayCanvas.height = newHeight;
  //     this.layersService.resize(newWidth, newHeight);

  //     if (zoomFactor !== ZOOM.MIN && zoomFactor !== ZOOM.MAX) {
  //         this.zoomFactor = zoomFactor;
  //         this.offsetX += (oldWidth - newWidth) / 2;
  //         this.offsetY += (oldHeight - newHeight) / 2;
  //     }
  //     this.adjustOffsets();
  //     this.transform();
  //     this.updateCanvasDisplayRatio();
  // }

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
      this.backgroundCanvas.displayCanvas.width >
      this.backgroundCanvas.originalCanvas.width
        ? this.backgroundCanvas.originalCanvas.width
        : this.backgroundCanvas.displayCanvas.width;
    const displayH =
      this.backgroundCanvas.displayCanvas.height >
      this.backgroundCanvas.originalCanvas.height
        ? this.backgroundCanvas.originalCanvas.height
        : this.backgroundCanvas.displayCanvas.height;
    this.offsetX =
      this.backgroundCanvas.originalCanvas.width * percentX - displayW / 2;
    this.offsetY =
      this.backgroundCanvas.originalCanvas.height * percentY - displayH / 2;
    this.adjustOffsets();
    this.transform();
  }

  // Function that transforms the editor view according to the zoomFactor and offsets properties.
  transform(): void {
    if (!this.backgroundCanvas || !this.backgroundCanvas.originalCanvas) {
      return;
    }
    this.backgroundCanvas.setOffset(this.offsetX, this.offsetY);

    this.backgroundCanvas.draw();

    // this.layersService.biomarkerCanvas.forEach(layer => {
    //   layer.setOffset(this.offsetX, this.offsetY);
    //   layer.draw();
    // });

    // Redraw the zoom rectangle.
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
      this.backgroundCanvas.originalCanvas.width /
      this.backgroundCanvas.originalCanvas.height
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
      (clientX * this.backgroundCanvas.displayCanvas.width) /
      this.backgroundCanvas.displayCanvas.getBoundingClientRect().width;
    const canvasY =
      (clientY * this.backgroundCanvas.displayCanvas.height) /
      this.backgroundCanvas.displayCanvas.getBoundingClientRect().height;
    return new Point(canvasX, canvasY);
  }

  getMousePositionInDisplaySpace(clientPosition: Point): Point {
    const x = clientPosition.x - this.viewPort.getBoundingClientRect().left;
    const y = clientPosition.y - this.viewPort.getBoundingClientRect().top;

    return new Point(x, y);
  }

  // getTasks(display_progress= false): Observable<Task[]> {
  //     if (display_progress) {
  //         const userId = JSON.parse(localStorage.getItem('currentUser')).user.id;
  //         const req = this.http.get<Task[]>(`/api/tasks/${userId}/${this.imageId}/`, {observe: 'events', reportProgress: true});
  //         return this.headerService.display_progress(req, 'Downloading: Tasks List');
  //     } else {
  //         const userId = JSON.parse(localStorage.getItem('currentUser')).user.id;
  //         return this.http.get<Task[]>(`/api/tasks/${userId}/${this.imageId}/`);
  //     }
  // }

  // TODO: Make this work
  // Function called from gallery/tasks to load a new image and redirect to editor
  loadImageFromServer(imageId: string): void {
    // console.log('EditorService::loadImageFromServer()');

    // TODO: change to above
    // const req = this.http.get<ImageServer>('/api/images/1/', {observe: 'events', reportProgress: true});
    const req = this.http.get<ImageServer>(`/api/images/get/${imageId}/`, {
      observe: 'events',
      reportProgress: true,
    });
    this.headerService
      .display_progress(req, 'Downloading: Image')
      .subscribe((res) => {
        this.imageLocal = null;
        this.imageServer = res;

        this.setImageId(imageId);
        this.router.navigate(['/' + 'editor']);
      });
  }

  loadMetadata(imageId: string): void {
    // this.http.get<ImageServer>(`/api/images/${imageId}/`).subscribe(res => {
    //     this.imageServer = res;
    // });
  }

  saveSVGFile(): void {
    if (!this.backgroundCanvas || !this.backgroundCanvas.originalCanvas) {
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
    // console.log('EditorService::setImageId()');

    this.imageId = id;
  }
}
