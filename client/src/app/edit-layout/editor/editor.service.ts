import { AppService } from './../../app.service';
import { BiomarkersService } from './../right-menu/biomarkers/biomarkers.service';
import { BackgroundCanvas } from './../../model/background-canvas';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EventEmitter } from '@angular/core';
import { LayersService, ANNOTATION_PREFIX } from './layers/layers.service';
import { BehaviorSubject, throwError } from 'rxjs';
import { Point } from './../../model/point';
import { GalleryService } from '../../gallery/gallery.service';
import { LocalStorage } from './../../model/local-storage';
import { Task } from './../../model/common/task.model';
import { Observable } from 'rxjs';
import { ROUTES } from './../../routes';
import { Router } from '@angular/router';
import * as FileSaver from 'file-saver';
import { Image as ImageServer } from '../../model/common/image.model';
import { CommentsService } from '../right-menu/comments/comments.service';
import { VisualizationService } from '../right-menu/visualization/visualization.service';
import { HeaderService } from '../../header/header.service';
import { tap, catchError } from 'rxjs/operators';

// Min and max values for zooming
const ZOOM = {
    MIN: 0.5,
    MAX: 16.0
};
const ZOOM_SCALE = 0.3 / 487; // unit: screen_width/pixel; 487mm is the median screen width; 0.3mm is the desired pixel size

const PREPROCESSING_TYPE = 1; // Eventually there could be more.

@Injectable()
export class EditorService {
    imageLocal: HTMLImageElement;
    imageServer: ImageServer;
    zoomFactor: number;     // mm / pixel
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

    constructor(private http: HttpClient, public layersService: LayersService, public commentService: CommentsService,
        public galleryService: GalleryService, public biomarkersService: BiomarkersService, public router: Router,
        private appService: AppService, private headerService: HeaderService) {
        this.scaleX = 1;
        this.imageLoaded = false;
        this.canvasDisplayRatio = new BehaviorSubject<number>(1);
        // Check if a change was made to save to localStorage every 30 seconds.
        setInterval(() => {
            if (this.layersService.unsavedChange) {
                LocalStorage.save(this, this.layersService);
                this.layersService.unsavedChange = false;
            }
        }, 30000);
    }

    // Reads the current display canvas dimensions and update canvasDisplayRatio.
    updateCanvasDisplayRatio(): void {
        const ratio = this.backgroundCanvas.displayCanvas.getBoundingClientRect().width /
            this.backgroundCanvas.displayCanvas.width;
        this.canvasDisplayRatio.next(ratio);
    }

    // Resizes the canvases to the current window size.
    resize(): void {
        if (!this.backgroundCanvas || !this.backgroundCanvas.originalCanvas) { return; }
        const viewportRatio = this.viewportRatio();
        let H, W;
        if (this.originalImageRatio() > viewportRatio) {
            W = this.backgroundCanvas.originalCanvas.width;
            H = W * (1 / viewportRatio);
        } else {
            H = this.backgroundCanvas.originalCanvas.height;
            W = H * viewportRatio;
        }

        // Resize main image.
        this.fullCanvasWidth = W;
        this.fullCanvasHeight = H;

        this.zoom(0);

        /* const h = H / this.zoomFactor;
        const w = W / this.zoomFactor;

        this.backgroundCanvas.displayCanvas.width = w;
        this.backgroundCanvas.displayCanvas.height = h;

        // Resize layers.
        this.layersService.resize(w, h);

        // Call zoom to redraw everything.
        this.adjustOffsets();
        this.transform();
        this.updateCanvasDisplayRatio(); */
    }

    init(svgLoaded: EventEmitter<any>): void {
        this.biomarkersService.dataSource = null;
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
        let x = 0, y = 0;
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
        this.http.get(`/api/revisions/emptyRevision/${this.galleryService.selected.id}`,
            { headers: new HttpHeaders(), responseType: 'json' }).pipe(
            ).subscribe(
            res => {
                this.layersService.biomarkerCanvas = [];
                this.svgBox.innerHTML = (res as any).svg;
                const parser = new DOMParser();
                const xmlDoc = parser.parseFromString((res as any).svg, 'image/svg+xml');
                const arbre: SVGGElement[] = [];
                Array.from(xmlDoc.children).forEach((e: SVGGElement) => {
                    const elems = e.getElementsByTagName('g');
                    for (let j = 0; j < elems.length; j++) {
                        if (elems[j].parentElement.tagName !== 'g') {
                            arbre.push(elems[j]);
                        }
                    }
                });
                arbre.forEach((e: SVGGElement) => {
                    this.layersService.createFlatCanvasRecursive(e,
                        this.backgroundCanvas.originalCanvas.width,
                        this.backgroundCanvas.originalCanvas.height);
                });
                this.svgLoaded.emit(arbre);
            });
    }

    // Loads a revision from the server. Draws that revision optionnaly.
    loadRevision(draw: boolean): void {
        const userId = JSON.parse(localStorage.getItem('currentUser')).user.id;
        const req = this.http.get(`api/revisions/svg/${userId}/${this.imageId}`, { headers: new HttpHeaders(),
                                                                                   reportProgress: true, observe: 'events' });
        this.headerService.display_progress(req, 'Downloading Preannotations').subscribe(
            res => {
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

                this.commentService.comment = res.diagnostic;

                if (draw) {
                    this.layersService.biomarkerCanvas = [];
                    arbre.forEach((e: SVGGElement) => {
                        this.layersService.createFlatCanvasRecursive(e);
                    });
                    this.layersService.toggleBorders(true);
                    setTimeout(() => { LocalStorage.save(this, this.layersService); }, 1000);
                }
                this.svgLoaded.emit(arbre);
            }, error => {
                if (error.status === 404) {
                    const reqBase = this.http.get(`/api/images/${this.imageId}/baseRevision/`,
                                                  { headers: new HttpHeaders(), observe: 'events',  reportProgress: true});
                    this.headerService.display_progress(reqBase, 'Downloading Preannotations').subscribe(res => {
                            this.svgBox.innerHTML = (res as any).svg;
                            const parser = new DOMParser();
                            const xmlDoc = parser.parseFromString((res as any).svg, 'image/svg+xml');
                            const arbre: SVGGElement[] = [];
                            Array.from(xmlDoc.children).forEach((e: SVGGElement) => {
                                const elems = e.getElementsByTagName('g');
                                for (let j = 0; j < elems.length; j++) {
                                    if (elems[j].parentElement.tagName !== 'g') {
                                        arbre.push(elems[j]);
                                    }
                                }
                            });
                            this.commentService.comment = (res as any).diagnostic;
                            if (draw) {
                                this.layersService.biomarkerCanvas = [];
                                arbre.forEach((e: SVGGElement) => {
                                    this.layersService.createFlatCanvasRecursive(e);
                                });
                                setTimeout(() => { LocalStorage.save(this, this.layersService); }, 1000);
                            }
                            this.svgLoaded.emit(arbre);
                        });
                }
            });
    }

    // Load the main image in the background canvas.
    public loadMainImage(image: HTMLImageElement): void {
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
        let x = 0, y = 0;
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
        this.imageLoaded = true;
        setTimeout(() => {
            // We use setTimeout
            const zoomCanvas: HTMLCanvasElement = document.getElementById('zoom-canvas') as HTMLCanvasElement;
            zoomCanvas.width = this.backgroundCanvas.originalCanvas.width;
            zoomCanvas.height = this.backgroundCanvas.originalCanvas.height;
            const zoomContext = zoomCanvas.getContext('2d');
            zoomContext.drawImage(this.backgroundCanvas.originalCanvas, 0, 0);
            this.resize();
        }, 0);
        this.updateCanvasDisplayRatio();
    }

    getMainImage(): void {
        const req = this.http.get(`/api/images/${this.imageId}/getFile`, { responseType: 'blob', observe: 'events',
                                                                           reportProgress: true });
        this.headerService.display_progress(req, 'Downloading: Image').subscribe(
            res => {
                const reader: FileReader = new FileReader();
                reader.onload = () => {
                    const image = new Image();
                    image.onload = () => {
                        this.loadMainImage(image);
                        this.loadPretreatmentImage();
                    };
                    image.src = reader.result as string;
                };
                reader.readAsDataURL(res);
            });
    }

    // Check if the browser's local storage contains a usable revision
    // that should be loaded.
    shouldLoadLocalStorage(lastImageId: string): boolean {
        return lastImageId && // Load if there is an imageId in the localStorage...
            (
                !this.imageId || // ... and there is no currently selected imageId ...
                (                // .. or that selected image is the same one as localStorage and
                    //    not a local file system image
                    this.imageId === lastImageId &&
                    this.imageId !== 'local'
                )
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
            this.loadRevision(false);
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

    public loadPretreatmentImage(): void {
        const req = this.http.get(`/api/preprocessings/${this.imageId}/${PREPROCESSING_TYPE}`, { responseType: 'blob',
                                                                                                 reportProgress: true,
                                                                                                 observe: 'events' });
        this.headerService.display_progress(req, 'Downloading: Pre-Processing').subscribe(
            res => {
                const reader: FileReader = new FileReader();
                reader.onload = () => {
                    const image = new Image();
                    image.onload = () => {
                        this.backgroundCanvas.setPretreatmentImage(image);
                    };
                    image.src = reader.result as string;
                };
                reader.readAsDataURL(res);
            },
            err => {
                // console.log('Error: ' + err);
            }
        );
    }

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
        const zoomCanvas: HTMLCanvasElement = document.getElementById('zoom-canvas') as HTMLCanvasElement;
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
            const realHeight = this.backgroundCanvas.displayCanvas.getBoundingClientRect().height;
            const realWidth = this.backgroundCanvas.displayCanvas.getBoundingClientRect().width;
            const zoomScale = this.zoomScale(this.zoomFactor);
            let h: number, w: number;
            if (this.originalImageRatio() > this.viewportRatio()) {
                w = zoomCanvas.width / zoomScale;
                h = Math.min(w * (realHeight / realWidth), zoomCanvas.height);
            } else {
                h = zoomCanvas.height / zoomScale;
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

    // Function to zoom on a part of the image.
    // Currently only centered with specific ratios.
    zoom(delta: number, position: Point= null): void {
        let zoomFactor = this.zoomFactor * Math.exp(delta);

        // Cap the values.
        if (zoomFactor > ZOOM.MAX) { zoomFactor = ZOOM.MAX;
        } else if (zoomFactor < ZOOM.MIN) { zoomFactor = ZOOM.MIN; }

        const zoomScale = this.zoomScale(zoomFactor);

        // Adjust canvas sizes.
        const oldWidth = this.backgroundCanvas.displayCanvas.width;
        const oldHeight = this.backgroundCanvas.displayCanvas.height;
        const newWidth = this.backgroundCanvas.originalCanvas.width / zoomScale;
        const newHeight = newWidth / this.viewportRatio();
        this.backgroundCanvas.displayCanvas.width = newWidth;
        this.backgroundCanvas.displayCanvas.height = newHeight;
        this.layersService.resize(newWidth, newHeight);

        if (zoomFactor !== ZOOM.MIN && zoomFactor !== ZOOM.MAX) {
            this.zoomFactor = zoomFactor;
            // Adjust offsets to keep them coherent with the previous zoom.
            let positionXPercentage = 0.5;
            let positionYPercentage = 0.5;
            if (position !== null) {
                positionXPercentage = Math.min(Math.max(position.x / oldWidth, 0), 1);
                positionYPercentage = Math.min(Math.max(position.y / oldHeight, 0), 1);
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

    setZoomFactor(zoomFactor: number): void {
        // Cap the values.
        if (zoomFactor > 1) { zoomFactor = 1;
        } else if (zoomFactor < 0) { zoomFactor = 0; }
        zoomFactor = ZOOM.MAX * zoomFactor + ZOOM.MIN;

        const zoomScale = this.zoomScale(zoomFactor);

        // Adjust canvas sizes.
        const oldWidth = this.backgroundCanvas.displayCanvas.width;
        const oldHeight = this.backgroundCanvas.displayCanvas.height;
        const newWidth = this.backgroundCanvas.originalCanvas.width / zoomScale;
        const newHeight = newWidth / this.viewportRatio();
        this.backgroundCanvas.displayCanvas.width = newWidth;
        this.backgroundCanvas.displayCanvas.height = newHeight;
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

    // Function that transforms the editor view according to the zoomFactor and offsets properties.
    transform(): void {
        if (!this.backgroundCanvas || !this.backgroundCanvas.originalCanvas) { return; }
        this.backgroundCanvas.setOffset(this.offsetX, this.offsetY);
        this.backgroundCanvas.draw();
        this.layersService.biomarkerCanvas.forEach(layer => {
            layer.setOffset(this.offsetX, this.offsetY);
            layer.draw();
        });
        // Redraw the zoom rectangle.
        this.updateZoomRect();
    }

    // Return the width/height ratio of the viewport (displayed).
    viewportRatio(): number {
        return this.viewPort.getBoundingClientRect().width / this.viewPort.getBoundingClientRect().height;
    }

    // Return the width/height ratio of the original image.
    originalImageRatio(): number {
        return this.backgroundCanvas.originalCanvas.width / this.backgroundCanvas.originalCanvas.height;
    }

    zoomScale(zoomFactor:number=null): number {
        if(zoomFactor === null)
            zoomFactor = this.zoomFactor;
        const mm_per_pixel = screen.width / window.devicePixelRatio * ZOOM_SCALE;
        return zoomFactor * mm_per_pixel;
    }

    getMousePositionInCanvasSpace(clientPosition: Point): Point {
        let clientX: number;
        let clientY: number;
        clientX = this.scaleX === 1 ?
            clientPosition.x - this.viewPort.getBoundingClientRect().left :
            this.viewPort.clientWidth - clientPosition.x + this.viewPort.getBoundingClientRect().left;

        clientY = clientPosition.y - this.viewPort.getBoundingClientRect().top;
        const canvasX = clientX * this.backgroundCanvas.displayCanvas.width /
            this.backgroundCanvas.displayCanvas.getBoundingClientRect().width;
        const canvasY = clientY * this.backgroundCanvas.displayCanvas.height /
            this.backgroundCanvas.displayCanvas.getBoundingClientRect().height;
        return new Point(canvasX, canvasY);
    }

    getMousePositionInDisplaySpace(clientPosition: Point): Point {
        const x = clientPosition.x - this.viewPort.getBoundingClientRect().left;
        const y = clientPosition.y - this.viewPort.getBoundingClientRect().top;

        return new Point(x, y);
    }

    getTasks(display_progress= false): Observable<Task[]> {
        if (display_progress) {
            const userId = JSON.parse(localStorage.getItem('currentUser')).user.id;
            const req = this.http.get<Task[]>(`/api/tasks/${userId}/${this.imageId}/`, {observe: 'events', reportProgress: true});
            return this.headerService.display_progress(req, 'Downloading: Tasks List');
        } else {
            const userId = JSON.parse(localStorage.getItem('currentUser')).user.id;
            return this.http.get<Task[]>(`/api/tasks/${userId}/${this.imageId}/`);
        }
    }

    // Function called from gallery/tasks to load a new image and redirect to editor
    loadImageFromServer(imageId: string): void {
        const req = this.http.get<ImageServer>(`/api/images/${imageId}/`, {observe: 'events', reportProgress: true});
        this.headerService.display_progress(req, 'Downloading: Image').subscribe(
            res => {
                this.imageLocal = null;
                this.imageServer = res;
                this.setImageId(imageId);
                this.router.navigate(['/' + ROUTES.EDITOR]);
            }
        );
    }

    loadMetadata(imageId: string): void {
        this.http.get<ImageServer>(`/api/images/${imageId}/`).subscribe(res => {
            this.imageServer = res;
        });
    }

    saveSVGFile(): void {
        if (!this.backgroundCanvas || !this.backgroundCanvas.originalCanvas) { return; }
        this.layersService.biomarkerCanvas.forEach(b => {
            const elem = document.getElementById((b.id).replace(ANNOTATION_PREFIX, ''));
            const url = b.currentCanvas.toDataURL();
            elem.setAttribute('width', '100%');
            elem.setAttribute('height', '100%');
            elem.setAttribute('xlink:href', url);
        });
        const header = '<?xml version="1.0" encoding="UTF-8"?>';
        const blob = new Blob([header + this.svgBox.getElementsByTagName('svg')[0].outerHTML], { type: 'image/svg+xml' });
        FileSaver.saveAs(blob, this.localSVGName);
    }

    saveToDB(): Observable<Object> {
        if (!this.backgroundCanvas || !this.backgroundCanvas.originalCanvas) { return; }
        this.appService.loading = true;
        if (this.layersService.unsavedChange) {
            LocalStorage.save(this, this.layersService);
            this.layersService.unsavedChange = false;
        }
        this.layersService.biomarkerCanvas.forEach(b => {
            const elem = document.getElementById((b.id).replace(ANNOTATION_PREFIX, ''));
            if (!elem) {
                return throwError(b.id.replace(ANNOTATION_PREFIX, '') + ' was not found.');
            }
            const url = b.currentCanvas.toDataURL();
            elem.setAttribute('xlink:href', url);
        });
        const userId = JSON.parse(localStorage.getItem('currentUser')).user.id;
        const body = {
            svg: this.svgBox.getElementsByTagName('svg')[0].outerHTML,
            diagnostic: this.commentService.comment
        };
        const req = this.http.put(`/api/revisions/${userId}/${this.imageId}`, body, {reportProgress: true, observe: 'events'});
        const reqBody = this.headerService.display_progress(req, 'Saving Labels (do not refresh!)', false);
        reqBody.pipe( tap(() => { this.appService.loading = false; }));
        return reqBody;
    }

    setImageId(id: string): void {
        this.imageId = id;
    }

    updateTasks(tasks: Task[]): void {
        // server takes 'true' and 'false' instead of booleans
        tasks.forEach(x => {
            const body = {
                active: x.active ? 'true' : 'false',
                completed: x.completed ? 'true' : 'false',
            };
            this.http.put(`/api/tasks/${x.id}`, body).subscribe();
        });
    }
}
