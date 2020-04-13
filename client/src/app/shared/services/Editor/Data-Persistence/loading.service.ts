// Angular
import { Injectable } from '@angular/core';
import { Image as ImageServer } from '../../../models/serverModels/image.model';
import { Router } from '@angular/router';

import { HttpClient, HttpHeaders } from '@angular/common/http';

// Services
import { LayersService } from '../layers.service';
import { HeaderService } from '../../header.service';
import { WidgetStorageService } from './widgetStorage.service';

// Material
import { RevisionService } from '../revision.service';
import { BiomarkerService } from '../biomarker.service';
import { LocalStorage } from '../local-storage.service';
import { CanvasDimensionService } from '../canvas-dimension.service';
import { BackgroundCanvas } from '../Tools/background-canvas.service';
import { Task } from 'src/app/shared/models/serverModels/task.model';
import { TaskType } from 'src/app/shared/models/serverModels/taskType.model';

@Injectable({
		providedIn: 'root'
})
export class LoadingService {

  private imageId: string;
  private imageLocal: HTMLImageElement;
  private imageServer: ImageServer;
  private imageLoaded: boolean;
  private taskLoaded: Task;
  private taskTypeLoaded: TaskType

	constructor(
    private http: HttpClient,
    private headerService: HeaderService,
    public layersService: LayersService,
    private biomarkerService: BiomarkerService,
    private widgetService: WidgetStorageService,
    private revisionService: RevisionService,
    public canvasDimensionService: CanvasDimensionService,
    public router: Router,
    ){
    // Check if a change was made to save to localStorage every 30 seconds.
      setInterval(() => {
        if (this.layersService.unsavedChange) {
          LocalStorage.save(this, this.layersService);
          this.layersService.unsavedChange = false;
        }
      }, 10000);
  }

  public getImageId(): string{
    return this.imageId;
  }

  public setImageId(imageId: string): void {
    this.imageId = imageId;
  }

  public getImageLocal(): HTMLImageElement {
    return this.imageLocal;
  }

  public setImageLocal(imageLocal: HTMLImageElement): void {
    this.imageLocal = imageLocal;
  }

  public getImageServer(): ImageServer{
    return this.imageServer;
  }

  public setImageServer(imageServer: ImageServer): void{
    this.imageServer = imageServer
  }

  public getImageLoaded(): boolean{
    return this.imageLoaded;
  }

  public setImageLoaded(imageLoaded: boolean): void{
    this.imageLoaded = imageLoaded
  }

  public getTaskLoaded(): Task{
		return this.taskLoaded;
	}

	public setTaskLoaded(taskLoaded:Task): void{
    this.taskLoaded = taskLoaded;
  }

  public getTaskTypeLoaded(): TaskType{
		return this.taskTypeLoaded;
	}

	public setTaskTypeLoaded(taskTypeLoaded:TaskType): void{
    this.taskTypeLoaded = taskTypeLoaded;
	}

  // Function called from gallery/tasks to load a new image and redirect to editor
  loadImageFromServer(imageId: string): void {
    const req = this.http.get<ImageServer>(`/api/images/get/${imageId}/`, {
      observe: 'events',
      reportProgress: true
    });
    this.headerService
      .display_progress(req, 'Downloading: Image')
      .subscribe(res => {
        this.setImageLocal(null);
        this.setImageServer(res);
        this.setImageId(imageId);
        this.router.navigate(['/' + 'editor']);
      });
  }

  // Loads a revision from the server. Draws that revision optionnaly.
  public async loadRevision(drawTheAnnotation: boolean): Promise<void> {
    const userId = JSON.parse(localStorage.getItem('currentUser')).user.id;
    let currentAnnotationId = 'getEmpty';
    if ( this.getTaskLoaded() !== null && this.getTaskLoaded() !== undefined ){
      currentAnnotationId = this.getTaskLoaded().annotationId.toString();
    }
    this.layersService.biomarkerCanvas = [];
    const req = this.http.get(`/api/annotations/get/${currentAnnotationId}`, {
      headers: new HttpHeaders(),
      reportProgress: true,
      observe: 'events',
    });
    this.headerService
      .display_progress(req, 'Downloading Preannotations')
      .subscribe(
        (res) => {
        this.widgetService.setWidgets(res.widgets);
          if (drawTheAnnotation) {
              // Store the revision within the revision service.
              this.revisionService.revision = res.data;

              this.layersService.biomarkerCanvas = [];
              this.layersService.createFlatCanvasRecursiveJson(res.data, this.canvasDimensionService.backgroundCanvas.originalCanvas.width, this.canvasDimensionService.backgroundCanvas.originalCanvas.height);
              this.biomarkerService.initJsonRecursive(res.data);
              this.biomarkerService.buildTreeRecursive(res.data);
              setTimeout(() => { LocalStorage.clear(); LocalStorage.save(this, this.layersService); }, 1000);
          }
        },
        async (error) => {
          if (error.status === 404 || error.status === 500) {
            this.layersService.biomarkerCanvas = [];
            const reqBase = this.http.get(`/api/annotations/get/getEmpty/`, {
              headers: new HttpHeaders(),
              observe: 'events',
              reportProgress: true,
            });
            this.headerService
              .display_progress(reqBase, 'Downloading Preannotations')
              .subscribe((res) => {
                if (drawTheAnnotation) {
                  this.layersService.biomarkerCanvas = [];
                  this.layersService.createFlatCanvasRecursiveJson(res.data, this.canvasDimensionService.backgroundCanvas.originalCanvas.width, this.canvasDimensionService.backgroundCanvas.originalCanvas.height);
                  this.biomarkerService.initJsonRecursive(res.data);
                  this.biomarkerService.buildTreeRecursive(res.data);
                  setTimeout(() => { LocalStorage.clear(); LocalStorage.save(this, this.layersService); }, 1000);
              }
              });
          }
        }
      );
  }

  // Load the main image in the background canvas.
  public loadMainImage(image: HTMLImageElement): void {
    this.canvasDimensionService.backgroundCanvas = new BackgroundCanvas(
      document.getElementById('main-canvas') as HTMLCanvasElement,
      image
    );
    // Load the main canvas.
    const viewportRatio = this.canvasDimensionService.viewportRatio();
    const imageRatio = this.canvasDimensionService.originalImageRatio();
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
    this.setImageLoaded(true);
    setTimeout(() => {
      // We use setTimeout
      const zoomCanvas: HTMLCanvasElement = document.getElementById(
        'zoom-canvas'
      ) as HTMLCanvasElement;
      zoomCanvas.width = this.canvasDimensionService.backgroundCanvas.originalCanvas.width;
      zoomCanvas.height = this.canvasDimensionService.backgroundCanvas.originalCanvas.height;
      const zoomContext = zoomCanvas.getContext('2d');
      zoomContext.drawImage(this.canvasDimensionService.backgroundCanvas.originalCanvas, 0, 0);
      this.canvasDimensionService.resize();
    }, 0);
    this.canvasDimensionService.updateCanvasDisplayRatio();
  }

  getMainImage(): void {
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
            this.loadMainImage(image);
            // TODO
            // this.loadPretreatmentImage();
          };
          image.src = reader.result as string;
        };
        reader.readAsDataURL(res);
      });
  }

  shouldLoadLocalStorage(lastImageId: string): boolean {
    return (
      lastImageId && // Load if there is an imageId in the localStorage...
      (!this.imageId || // ... and there is no currently selected imageId ... // .. or that selected image is the same one as localStorage and
        //    not a local file system image
        (this.imageId === lastImageId && this.imageId !== 'local'))
    );
  }

  public loadAll(): void {
    // Check if a an image is saved in localStorage
    const lastImageId = LocalStorage.lastSavedImageId();

    if (this.shouldLoadLocalStorage(lastImageId)) {
      this.imageId = lastImageId;
      this.getMainImage();
      this.loadRevision(true);
      //LocalStorage.load(this, this.layersService);
      this.loadMetadata(this.imageId);
      return;
    }
    // Check if imageId is set
    if (!this.imageId) {
      return;
    }
  }

  public loadMetadata(imageId: string): void {
    // this.http.get<ImageServer>(`/api/images/${imageId}/`).subscribe(res => {
    //   this.imageServer = res;
    // });
  }

}
