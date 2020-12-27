// Angular
import { Injectable, EventEmitter } from '@angular/core';
import { Image as ImageServer } from '../../../models/serverModels/image.model';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';

// Services
import { LayersService } from '../layers.service';
import { UIStatusService } from '../../ui-status.service';
import { WidgetStorageService } from './widgetStorage.service';
import { RevisionService } from '../revision.service';
import { BiomarkerService } from '../biomarker.service';
import { CanvasDimensionService } from '../canvas-dimension.service';
import { LocalStorage } from '../local-storage-old.service';
import { BackgroundCanvas } from '../tools/background-canvas.service';

// Model
import { Task } from 'src/app/shared/models/serverModels/task.model';
import { TaskType } from 'src/app/shared/models/serverModels/taskType.model';
import { Subject } from 'rxjs';

const SAVE_TIME_INTERVAL = 10000; // 10 seconds

@Injectable({
		providedIn: 'root'
})

export class LoadingService {

  private imageId: string;
  private imageLocal: HTMLImageElement;
  private imageServer: ImageServer;
  private imageLoaded: boolean;
  private taskLoaded: Task;
  private taskTypeLoaded: TaskType;
  commentsHasBeenLoaded: Subject<any>;

	constructor(
    private http: HttpClient,
    private headerService: UIStatusService,
    private biomarkerService: BiomarkerService,
    private widgetService: WidgetStorageService,
    private revisionService: RevisionService,
    public canvasDimensionService: CanvasDimensionService,
    public layersService: LayersService,
    public router: Router,
    ){
      this.saveFromInterval(SAVE_TIME_INTERVAL);
      this.commentsHasBeenLoaded = new Subject<any>();
  }

  // Check if a change was made to save to localStorage every 10 seconds.
  public saveFromInterval(timeInterval: number){
    setInterval(() => {
      if (this.layersService.unsavedChange) {
        LocalStorage.save(this, this.layersService);
        this.layersService.unsavedChange = false;
      }
    }, timeInterval);
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

  // Get AnnotationId sent for a request
  public getAnnotationId(){
    let currentAnnotationId = '';
    if ( this.getTaskLoaded() === null || this.getTaskLoaded() === undefined ){
      currentAnnotationId = 'getEmpty'; // blank Workspace loaded when no id is found
    }else{
      currentAnnotationId = this.getTaskLoaded().annotationId.toString();
    }
    return currentAnnotationId;
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
    const currentAnnotationId = this.getAnnotationId();
    this.layersService.biomarkerCanvas = [];
    const req = this.http.get(`/api/annotations/get/${currentAnnotationId}`, {
      headers: new HttpHeaders(),reportProgress: true, observe: 'events',
    });
    this.headerService
      .display_progress(req, 'Downloading Preannotations')
      .subscribe(
        (res) => {
          if (res.comments !== undefined && res.comments && res.comments.length > 0) {
            this.commentsHasBeenLoaded.next(res.comments);
          }

        this.widgetService.setWidgets(res.widgets);
          if (drawTheAnnotation) {
            this.loadAnnotationDatas(res.data);
          }},
        async (error) => {
          if (error.status === 404 || error.status === 500) {
            const reqBase = this.http.get(`/api/annotations/get/getEmpty/`, {
              headers: new HttpHeaders(),observe: 'events',reportProgress: true,
            });
            this.headerService
              .display_progress(reqBase, 'Downloading Preannotations')
              .subscribe((res) => {
                if (drawTheAnnotation) {
                 this.loadAnnotationDatas(res.data);
                }});
          }}
      );
  }

  // Add loaded annotation on some EditorTools
  loadAnnotationDatas(data: object){
    this.revisionService.revision = data; // Store the loaded annotations within the revision service.
    this.layersService.biomarkerCanvas = [];
    if(LocalStorage.hasAnnotationStored() && this.shouldLoadLocalStorage(LocalStorage.lastSavedImageId())){
      // Add Annotations of localStorage
      LocalStorage.load(this, this.layersService);
    }
    else{
      // Add Annotation datas  of the server on the biomarkerCanvas
      this.layersService.createFlatCanvasRecursiveJson(
        data,
        this.canvasDimensionService.backgroundCanvas.originalCanvas.width,
        this.canvasDimensionService.backgroundCanvas.originalCanvas.height
      );
    }
    this.biomarkerService.initJsonRecursive(data);  // Add Annotation datas on Annotation selection right box
    this.biomarkerService.buildTreeRecursive(data); // Build the annotation tree right box

    setTimeout(() => {LocalStorage.save(this, this.layersService); }, 1000);

  }

  // Load the main image in the background canvas.
  public loadMainImage(image: HTMLImageElement): void {
     // Load the main canvas.
     this.canvasDimensionService.backgroundCanvas = new BackgroundCanvas(
      document.getElementById('main-canvas') as HTMLCanvasElement,
      image
    );
    this.canvasDimensionService.loadMainCanvas();
    this.setImageLoaded(true);
    this.canvasDimensionService.loadZoomCanvas();
    this.canvasDimensionService.resize();
    this.canvasDimensionService.updateCanvasDisplayRatio();
  }

  // Load canvases and local variables when opening a local image.
  public async loadAllLocal(image: HTMLImageElement, svgLoaded: EventEmitter<any>): Promise<void> {
    this.setImageLoaded(true);
    this.canvasDimensionService.backgroundCanvas = new BackgroundCanvas(
      document.getElementById('main-canvas') as HTMLCanvasElement,
      this.getImageLocal()
    );

    // Load the main canvas.
    this.canvasDimensionService.loadMainCanvas();
    this.canvasDimensionService.loadZoomCanvas();
    this.canvasDimensionService.updateCanvasDisplayRatio();

    this.http.get(`/api/annotations/get/getEmpty/`, {
        headers: new HttpHeaders(),
      })
      .pipe()
      .subscribe((res:any) => {
        this.loadAnnotationDatas(res.data);
      });
  }

  async getMainImage(): Promise<void> {
    const req = this.http.get(`/api/images/download/${this.imageId}/raw`, {
      responseType: 'blob',
      observe: 'events',
      reportProgress: true,
    });

    const res = await this.headerService
      .display_progress(req, 'Downloading: Image')
      .toPromise();
    await this.loadImage(res);

  }

  async loadImage(res: any) {
      return new Promise<void>((resolve, reject) => {
        const reader: FileReader = new FileReader();
        reader.onload = () => {
            const image = new Image();
            image.onload = () => {
                resolve(this.loadMainImage(image));
                // this.loadPretreatmentImage();
                };
            image.src = reader.result as string;
        };
        reader.readAsDataURL(res);
      })
  }

  shouldLoadLocalStorage(lastImageId: string): boolean {
    return (
      lastImageId && // Load if there is an imageId in the localStorage...
      (!this.imageId || // ... and there is no currently selected imageId ... // .. or that selected image is the same one as localStorage and
        //    not a local file system image
        (this.imageId === lastImageId && this.imageId !== 'local'))
    );
  }

  // Load Everything in the editor
  public async loadAll(): Promise<void> {
    // Check if a an image is saved in localStorage
    const lastImageId = LocalStorage.lastSavedImageId();

    if (this.shouldLoadLocalStorage(lastImageId)) {
      this.imageId = lastImageId;
      await this.getMainImage().then(() => {
          this.loadRevision(true);
      });

      this.loadMetadata(this.imageId);
      return;
    }
    // Check if imageId is set
    if (!this.imageId) {
      return;
    }
    await this.getMainImage();
    this.loadRevision(true);
  }

  public loadMetadata(imageId: string): void {
    // this.http.get<ImageServer>(`/api/images/${imageId}/`).subscribe(res => {
    //   this.imageServer = res;
    // });
  }
}