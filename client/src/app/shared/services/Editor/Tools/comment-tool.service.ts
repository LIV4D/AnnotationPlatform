import { Tool } from './tool.service';
import { Point } from './point.service';
import { EditorService } from '../editor.service';
import { LayersService } from '../layers.service';
import { BiomarkerService } from '../biomarker.service';

export class CommentTool extends Tool {

  private position: Point;

  constructor(name: string, iconPath: string, tooltip: string,
              editorService: EditorService, layersService: LayersService, biomarkerService: BiomarkerService) {
      super(name, iconPath, tooltip, editorService, layersService);
  }

  onCursorDown(point: Point): void {
      this.position = point;
      const currentBiomarker = this.layersService.getCurrentBiomarkerCanvas();
      if (currentBiomarker) {

      }
  }

  onCursorUp(): void {

  }
}
