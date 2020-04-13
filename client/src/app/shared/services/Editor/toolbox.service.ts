import { Injectable } from '@angular/core';

import { Tool } from './Tools/tool.service';
import { Point } from './Tools/point.service';
import { FillBrush } from './Tools/fill-brush.service';
import { Brush } from './Tools/brush.service';
import { Eraser } from './Tools/eraser.service';
import { Hand } from './Tools/hand.service';
import { LassoEraser } from './Tools/lasso-eraser.service';
import { BioPicker } from './Tools/biopicker.service';
import { CommentTool } from './Tools/comment-tool.service';

import { TOOL_NAMES } from './../../constants/tools';

import { BehaviorSubject, Subject } from 'rxjs';

import { LayersService } from './layers.service';
import { ToolPropertiesService } from './tool-properties.service';
import { BiomarkerService } from './biomarker.service';
import { ImageBorderService } from './image-border.service';
import { CanvasDimensionService } from './canvas-dimension.service';

@Injectable({
  providedIn: 'root',
})
export class ToolboxService {
  selectedTool: BehaviorSubject<Tool>;
  commentBoxClicked: Subject<any>;
  listOfTools: Tool[];

  constructor(
    private layersService: LayersService,
    private canvasDimensionService: CanvasDimensionService,
    private toolPropertiesService: ToolPropertiesService,
    private biomarkerService: BiomarkerService,
    private imageBorderService: ImageBorderService
  ) {
    this.listOfTools = [
      new Hand(
        TOOL_NAMES.PAN,
        '../assets/icons/hand.svg',
        'Pan (P)',
        canvasDimensionService,
        layersService
      ),
      new Brush(
        TOOL_NAMES.BRUSH,
        '../assets/icons/brush.svg',
        'Brush (B)',
        canvasDimensionService,
        layersService,
        toolPropertiesService
      ),
      // new Tool( '../assets/icons/lasso.png', 'Partial selection tool'),
      new FillBrush(
        TOOL_NAMES.FILL_BRUSH,
        '../assets/icons/brush-fill.svg',
        'Fill Brush (F)',
        canvasDimensionService,
        layersService,
        toolPropertiesService
      ),
      // new PointByPointBucket(TOOL_NAMES.FILL_VECTOR, '../assets/icons/vector.svg', 'Fill Vector (V)'),
      new Eraser(
        TOOL_NAMES.ERASER,
        '../assets/icons/eraser.svg',
        'Eraser (E)',
        canvasDimensionService,
        layersService,
        toolPropertiesService
      ),
      new LassoEraser(
        TOOL_NAMES.LASSO_ERASER,
        '../assets/icons/lasso-eraser.svg',
        'Lasso Eraser (G)',
        canvasDimensionService,
        layersService,
        toolPropertiesService
      ),
      new BioPicker(
        TOOL_NAMES.BIO_PICKER,
        '../assets/icons/picker.svg',
        'Pick Biomarker (K)',
        canvasDimensionService,
        layersService,
        biomarkerService
      ),

      new CommentTool(
        TOOL_NAMES.COMMENT_TOOL,
        '../assets/icons/comment-box.png',
        'Add comment',
        canvasDimensionService,
        layersService,
        biomarkerService
      ),

      new Tool(
        TOOL_NAMES.UNDO,
        '../assets/icons/undo.svg',
        navigator.platform.indexOf('Mac') === -1
          ? 'Undo (Ctrl + Z)'
          : 'Undo (Cmd + Z)',
        canvasDimensionService,
        layersService
      ),
      new Tool(
        TOOL_NAMES.REDO,
        '../assets/icons/redo.svg',
        navigator.platform.indexOf('Mac') === -1
          ? 'Redo (Ctrl + Y)'
          : 'Redo (Cmd + Y)',
        canvasDimensionService,
        layersService
      ),
    ];

    this.selectedTool = new BehaviorSubject<Tool>(this.listOfTools[0]);
    this.commentBoxClicked = new Subject<any>();
  }

  setSelectedTool(newSelectedTool: string): void {
    if (newSelectedTool === TOOL_NAMES.UNDO) {
      this.layersService.undo();
  } else if (newSelectedTool === TOOL_NAMES.REDO) {
      this.layersService.redo();
  } else {
      const tool: Tool = this.listOfTools.filter((toolToFilter) => toolToFilter.name === newSelectedTool)[0];
      this.selectedTool.next(tool);
  }

  }
  setUndo() {
    this.layersService.undo();
  }

  setRedo() {
    this.layersService.redo();
  }

  public onCursorDown(point: Point): void {
    if (
      this.imageBorderService.showBorders &&
      this.selectedTool.getValue().name !== TOOL_NAMES.PAN
    ) {
      this.imageBorderService.showBorders = false;
      this.layersService.toggleBorders(false);
    }
    if (this.selectedTool.getValue().name === TOOL_NAMES.COMMENT_TOOL) {
      // console.log('SHOW')
    }
    this.selectedTool.getValue().onCursorDown(point);
  }

  public onCursorUp(): void {
    if (this.selectedTool.getValue().name === TOOL_NAMES.COMMENT_TOOL) {
      this.commentBoxClicked.next({ commentClicked: true });
    }
    this.selectedTool.getValue().onCursorUp();
  }

  public onCursorOut(point: Point): void {
    this.selectedTool.getValue().onCursorOut(point);
  }

  public onCursorMove(point: Point): void {
    this.selectedTool.getValue().onCursorMove(point);
  }

  public onCancel(): void {
    this.selectedTool.getValue().onCancel();
  }


}
