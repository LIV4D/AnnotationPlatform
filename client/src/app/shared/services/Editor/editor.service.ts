import { Injectable, EventEmitter, ElementRef } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CanvasDimensionService } from './canvas-dimension.service';
import { BiomarkerService } from './biomarker.service';
import { CommentBoxSingleton } from '../../models/comment-box-singleton.model';
import { LoadingService } from './Data-Persistence/loading.service';
import { SubmitService } from './Data-Persistence/submit.service';
import { ZoomService } from './zoom.service';
import { ViewportService } from './viewport.service';

const PREPROCESSING_TYPE = 1; // Eventually there could be more.

@Injectable({
  providedIn: 'root',
})

// The service initialize mulitiple variables of others services
// linked with the EditorFacadeService at the same time
export class EditorService {
  offsetY: number;
  mouseDown = false;

  svgLoaded: EventEmitter<any>;
  menuState: boolean;

  commentBoxes: CommentBoxSingleton;

  constructor(
    public canvasDimensionService: CanvasDimensionService,
    private biomarkerService: BiomarkerService,
    public viewPortService: ViewportService,
    private loadingService: LoadingService,
    private submitService: SubmitService,
    private zoomService: ZoomService,
  ) {
    this.canvasDimensionService.scaleX = 1;
    this.loadingService.setImageLoaded(false);
    this.canvasDimensionService.canvasDisplayRatio = new BehaviorSubject<number>(1);
    this.commentBoxes = CommentBoxSingleton.getInstance();
  }

  init(svgLoaded: EventEmitter<any>, viewPort: ElementRef, svgBox: ElementRef): void
    {
      this.biomarkerService.dataSource = null;
      this.zoomService.zoomFactor = 1.0;
      this.canvasDimensionService.offsetX = 0;
      this.canvasDimensionService.offsetY = 0;
      this.loadingService.setImageLoaded(false);
      this.viewPortService.viewPort = viewPort.nativeElement;
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

  cancel() {}
}
