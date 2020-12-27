import { Injectable } from '@angular/core';
import { ToolboxService } from '../../../shared/services/editor/toolbox.service';
import { Tool } from '../../../shared/services/editor/tools/tool.service';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ToolboxFacadeService {
  constructor(private toolboxService: ToolboxService) {}

  setSelectedTool(newSelectedTool: string): void {
    this.toolboxService.setSelectedTool(newSelectedTool);
  }

  get listOfTools() {
    return this.toolboxService.listOfTools;
  }

  get selectedTool() {
    return this.toolboxService.selectedTool;
  }

  public setUndo() {
    this.toolboxService.setUndo();
  }

  public setRedo() {
    this.toolboxService.setRedo();
  }

  public setUndoRedoState() {
    this.toolboxService.setUndoRedoState();
  }

  public getValueOfCommentBoxClicked(): Subject <any> {
    return this.toolboxService.commentBoxClicked;
  }
}
