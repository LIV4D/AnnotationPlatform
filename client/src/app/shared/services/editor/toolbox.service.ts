import { Injectable } from '@angular/core';

import { Tool } from './tools/tool.service';
import { Point } from './tools/point.service';
import { FillBrush } from './tools/fill-brush.service';
import { Brush } from './tools/brush.service';
import { Eraser } from './tools/eraser.service';
import { Hand } from './tools/hand.service';
import { LassoEraser } from './tools/lasso-eraser.service';
import { BioPicker } from './tools/biopicker.service';

import { TOOL_NAMES } from '../../constants/tools';

import { BehaviorSubject, Subject } from 'rxjs';

import { LayersService } from './layers.service';
import { ToolPropertiesService } from './tool-properties.service';
import { BiomarkerVisibilityService } from './biomarker-visibility.service';
import { ImageBorderService } from './image-border.service';
import { CanvasDimensionService } from './canvas-dimension.service';
import { CommentBoxService } from './comment-box.service';
import { BiomarkerService } from './biomarker.service';

@Injectable({
  providedIn: 'root',
})

// The services provides usefull methods
// helping handling the tooldBox
export class ToolboxService {
  selectedTool: BehaviorSubject<Tool>;
  commentBoxClicked: Subject<any>;
  listOfTools: Tool[];

  constructor(
    private layersService: LayersService,
    public canvasDimensionService: CanvasDimensionService,
    private toolPropertiesService: ToolPropertiesService,
    private biomarkerService: BiomarkerService,
    private imageBorderService: ImageBorderService,
    private biomarkerVisibilityService: BiomarkerVisibilityService
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

      new FillBrush(
        TOOL_NAMES.FILL_BRUSH,
        '../assets/icons/brush-fill.svg',
        'Fill Brush (F)',
        canvasDimensionService,
        layersService,
        toolPropertiesService
      ),

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
        biomarkerService,
        biomarkerVisibilityService
      ),

      new CommentBoxService(
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
    }
    this.selectedTool.getValue().onCursorDown(point);
    this.setUndoRedoState();
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
    this.setUndoRedoState();
  }

  setUndoRedoState(): void {
    if (this.layersService.undoStack.getLength() === 0) {
      this.listOfTools.filter((tool) => tool.name === TOOL_NAMES.UNDO)[0].disabled = true;
    } else {
      this.listOfTools.filter((tool) => tool.name === TOOL_NAMES.UNDO)[0].disabled = false;
    }

    if (this.layersService.redoStack.getLength() === 0) {
      this.listOfTools.filter((tool) => tool.name === TOOL_NAMES.REDO)[0].disabled = true;
    } else {
      this.listOfTools.filter((tool) => tool.name === TOOL_NAMES.REDO)[0].disabled = false;
    }
  }

}
