import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
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

  // constructor() {
  //   this.commentBoxCheckBoxClicked = new Subject<any>();
  // }

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
    console.log('%c ONCURSOR_UP: ', 'color:black;background:yellow;');
    const currentBiomarker = this.layersService.getCurrentBiomarkerCanvas();
  }

  sendStateCommentBox(checkBoxCommentBox: boolean) {
    console.log('%c sendStateCommentBox: ', 'color:black;background:yellow;');
    this.commentBoxCheckBoxClicked.next(checkBoxCommentBox);
  }


}
