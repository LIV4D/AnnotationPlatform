import { Injectable } from '@angular/core';
import { ToolboxService } from './../../shared/services/Editor/toolbox.service';
import { Tool } from './../../shared/services/Editor/Tools/tool.service';

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

  public setUndoRedoState() {}
}
