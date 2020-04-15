import { Injectable, EventEmitter, ElementRef } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { LayersService } from './layers.service';
import { CanvasDimensionService } from './canvas-dimension.service';
import { HttpClient} from '@angular/common/http';
import { Point } from './Tools/point.service';
import { BiomarkerService } from './biomarker.service';
import { CommentBoxSingleton } from '../../models/comment-box-singleton.model';
import { LoadingService } from './Data-Persistence/loading.service';
import { SubmitService } from './Data-Persistence/submit.service';

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
  offsetY: number;
  mouseDown = false;
  scaleX: number;
  svgLoaded: EventEmitter<any>;
  menuState: boolean;

  commentBoxes: CommentBoxSingleton;

  constructor(
    private http: HttpClient,
    public layersService: LayersService,
    public canvasDimensionService: CanvasDimensionService,
    private biomarkerService: BiomarkerService,
    private loadingService: LoadingService,
    private submitService: SubmitService,
  ) {
    this.scaleX = 1;
    this.loadingService.setImageLoaded(false);
    this.canvasDimensionService.canvasDisplayRatio = new BehaviorSubject<number>(1);
    this.commentBoxes = CommentBoxSingleton.getInstance();
  }

  init(svgLoaded: EventEmitter<any>, viewPort: ElementRef, svgBox: ElementRef): void
    {
      this.biomarkerService.dataSource = null;
      this.canvasDimensionService.zoomFactor = 1.0;
      this.canvasDimensionService.offsetX = 0;
      this.canvasDimensionService.offsetY = 0;
      this.loadingService.setImageLoaded(false);
      this.canvasDimensionService.viewPort = viewPort.nativeElement;
      this.submitService.svgBox = svgBox.nativeElement;
      this.svgLoaded = svgLoaded;
      if (this.loadingService.getImageLocal()) {
        this.loadingService.setImageId('local');
        this.loadingService.loadAllLocal(this.loadingService.getImageLocal(), this.svgLoaded);
      } else {
        this.loadingService.loadAll();
      }
      this.canvasDimensionService.resize();
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
      this.canvasDimensionService.adjustOffsets();
      this.canvasDimensionService.transform();
      this.canvasDimensionService.updateCanvasDisplayRatio();
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

  cancel() {}
}
