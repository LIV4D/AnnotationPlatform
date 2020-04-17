import { Subject } from 'rxjs';
import { Tool } from './Tools/tool.service';
import { Point } from './Tools/point.service';
import { CanvasDimensionService } from './canvas-dimension.service';
import { LayersService } from './layers.service';
import { BiomarkerService } from './biomarker.service';

// @Injectable({
//   providedIn: 'root',
// })
export class CommentBoxService extends Tool {

  commentBoxCheckBoxClicked: Subject<boolean>;
  private position: Point;

  constructor(name: string, iconPath: string, tooltip: string, canvasDimensionService: CanvasDimensionService, layersService: LayersService, biomarkerService: BiomarkerService) {
    super(name, iconPath, tooltip, canvasDimensionService, layersService);

    this.commentBoxCheckBoxClicked = new Subject<any>();
  }

  onCursorDown(point: Point): void {
    this.position = point;
    const currentBiomarker = this.layersService.getCurrentBiomarkerCanvas();
    if (currentBiomarker) {

    }
  }

  onCursorUp(): void {
    const currentBiomarker = this.layersService.getCurrentBiomarkerCanvas();
  }

  sendStateCommentBox(checkBoxCommentBox: boolean) {
    this.commentBoxCheckBoxClicked.next(checkBoxCommentBox);
  }
}
