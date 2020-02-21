import { Injectable } from '@angular/core';
import { ToolboxService } from './../../shared/services/Editor/toolbox.service';
import { Tool } from './../../shared/models/tool.model';

@Injectable({
    providedIn: 'root'
})
export class ToolboxFacadeService {

    constructor(private toolboxService: ToolboxService) {
    }

    setSelectedTool(newSelectedTool: string): void {
        this.toolboxService.setSelectedTool(newSelectedTool);
    }

    public setUndo() {
        this.toolboxService.setUndo();
        this.toolboxService.setUndoRedoState();
    }

    public setRedo() {
        this.toolboxService.setRedo();
        this.toolboxService.setUndoRedoState();
    }

}
