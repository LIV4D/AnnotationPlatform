import { Component, OnInit } from '@angular/core';
import { AppService } from './../../shared/services/app.service';
import { HOTKEYS } from './../../shared/constants/hotkeys';
import { TOOL_NAMES } from './../../shared/constants/tools';
import { ToolboxFacadeService } from './toolbox.facade.service';

@Component({
  selector: 'app-toolbox',
  templateUrl: './toolbox.component.html',
  styleUrls: ['./toolbox.component.scss']
})
export class ToolboxComponent implements OnInit {
  constructor(public toolboxFacadeService: ToolboxFacadeService, public appService: AppService) { }

  ngOnInit(): void {
  }

  public onKeyDown(event: KeyboardEvent): void {
    if (this.appService.keyEventsEnabled) {
      switch (event.keyCode) {
        case HOTKEYS.KEY_P_PAN: {
          this.toolboxFacadeService.setSelectedTool(TOOL_NAMES.PAN);
          break;
        }
        case HOTKEYS.KEY_E_ERASER: {
          this.toolboxFacadeService.setSelectedTool(TOOL_NAMES.ERASER);
          break;
        }
        case HOTKEYS.KEY_G_LASSO_ERASER: {
          this.toolboxFacadeService.setSelectedTool(TOOL_NAMES.LASSO_ERASER);
          break;
        }
        case HOTKEYS.KEY_B_BRUSH: {
          this.toolboxFacadeService.setSelectedTool(TOOL_NAMES.BRUSH);
          break;
        }
        case HOTKEYS.KEY_F_FILL_BRUSH: {
          this.toolboxFacadeService.setSelectedTool(TOOL_NAMES.FILL_BRUSH);
          break;
        }
        case HOTKEYS.KEY_V_FILL_VECTOR: {
          this.toolboxFacadeService.setSelectedTool(TOOL_NAMES.FILL_VECTOR);
          break;
        }
        case HOTKEYS.KEY_K_PICKKER: {
          this.toolboxFacadeService.setSelectedTool(TOOL_NAMES.BIO_PICKER);
          break;
        }
        case HOTKEYS.KEY_CTRL_Z_UNDO: {
          if (this.commandOrCtrlPressed(event)) {
            this.toolboxFacadeService.setSelectedTool(TOOL_NAMES.UNDO);
            this.toolboxFacadeService.setUndoRedoState();
          }
          break;
        }
        case HOTKEYS.KEY_CTRL_Y_REDO: {
          if (this.commandOrCtrlPressed(event)) {
            this.toolboxFacadeService.setSelectedTool(TOOL_NAMES.REDO);
            this.toolboxFacadeService.setUndoRedoState();
          }
          break;
        }
      }
    }
  }

  public commandOrCtrlPressed(event: KeyboardEvent): boolean {
    return navigator.platform.indexOf('Mac') === -1 ? event.ctrlKey : event.metaKey;
  }

  get listOfTools() {
    return this.toolboxFacadeService.listOfTools;
  }

}
