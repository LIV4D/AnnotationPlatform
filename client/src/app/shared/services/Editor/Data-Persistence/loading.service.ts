// Angular
import { Injectable } from '@angular/core';
import { Image as ImageServer } from '../../../models/serverModels/image.model';
import { Router } from '@angular/router';

import { HttpClient, HttpHeaders } from '@angular/common/http';

// Services
import { LayersService } from '../layers.service';
import { HeaderService } from '../../header.service';
import { BridgeSingleton } from './bridge.service';
import { WidgetEventService } from '../widgetEvent.service';
import { WidgetStorageService } from './widgetStorage.service';

// Material
import { MatDialogRef } from '@angular/material/dialog';
import { RevisionService } from '../revision.service';
import { BiomarkerService } from '../biomarker.service';
import { LocalStorage } from '../local-storage.service';
import { EditorService } from '../editor.service';

@Injectable({
		providedIn: 'root'
})
export class LoadingService {

  private imageId: string;
  private imageLocal: HTMLImageElement;
  private imageServer: ImageServer;
  bridgeSingleton: BridgeSingleton;

	constructor(
    private http: HttpClient,
    private headerService: HeaderService,
    public layersService: LayersService,
    private biomarkerService: BiomarkerService,
    private widgetService: WidgetStorageService,
    private revisionService: RevisionService,
    public editorService: EditorService,
    public router: Router,
    ){
      this.bridgeSingleton = BridgeSingleton.getInstance();
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
        this.setImageId(imageId);
        this.setImageServer(res);
        this.router.navigate(['/' + 'editor']);
      });
  }

  // Loads a revision from the server. Draws that revision optionnaly.
  public async loadRevision(drawTheAnnotation: boolean, width, height): Promise<void> {
    const userId = JSON.parse(localStorage.getItem('currentUser')).user.id;
    let currentAnnotationId = 'getEmpty';
    if ( this.bridgeSingleton.getCurrentTask() !== null && this.bridgeSingleton.getCurrentTask() !== undefined ){
      currentAnnotationId = this.bridgeSingleton.getCurrentTask().annotationId.toString();
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
              this.layersService.createFlatCanvasRecursiveJson(res.data, width, height);
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
                  this.layersService.createFlatCanvasRecursiveJson(res.data, width, height);
                  this.biomarkerService.initJsonRecursive(res.data);
                  this.biomarkerService.buildTreeRecursive(res.data);
                  setTimeout(() => { LocalStorage.clear(); LocalStorage.save(this, this.layersService); }, 1000);
              }
              });
          }
        }
      );
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
            this.editorService.loadMainImage(image);
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

  public loadAll(width, height): void {
    // Check if a an image is saved in localStorage
    const lastImageId = LocalStorage.lastSavedImageId();

    if (this.shouldLoadLocalStorage(lastImageId)) {
      this.imageId = lastImageId;
      this.getMainImage();
      this.loadRevision(true, width, height);
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
