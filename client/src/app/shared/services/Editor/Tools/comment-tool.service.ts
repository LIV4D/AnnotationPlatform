import { Tool } from './tool.service';
import { Point } from './point.service';
import { LayersService } from '../layers.service';
import { BiomarkerService } from '../biomarker.service';
import { Comment } from './../../../models/comment.model';
import { CanvasDimensionService } from '../canvas-dimension.service';

export class CommentTool extends Tool {

  private position: Point;

  constructor(name: string, iconPath: string, tooltip: string,
              canvasDimensionService: CanvasDimensionService, layersService: LayersService, biomarkerService: BiomarkerService) {
      super(name, iconPath, tooltip, canvasDimensionService, layersService);
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
}
