import { Component, OnInit } from '@angular/core';
import { Tool } from 'src/app/shared/models/tool.model';
import { AppService } from './../../shared/services/app.service';
import { HOTKEYS } from './../../shared/constants/hotkeys';
import { TOOL_NAMES } from './../../shared/constants/tools';
import { ToolboxFacadeService } from './toolbox.facade.service';

import { Eraser } from './../../model/eraser';

@Component({
  selector: 'app-toolbox',
  templateUrl: './toolbox.component.html',
  styleUrls: ['./toolbox.component.scss']
})
export class ToolboxComponent implements OnInit {
  // TODO : This will move to its rightful place (Service)
  listOfTools: Tool[] = [
    new Tool('name', '../../../assets/icons/hand.svg'),
    new Tool('name', '../../../assets/icons/brush.svg'),
    new Tool('name', '../../../assets/icons/brush-fill.svg'),
    new Tool('name', '../../../assets/icons/eraser.svg'),
    new Tool('name', '../../../assets/icons/lasso-eraser.svg'),
    new Tool('name', '../../../assets/icons/picker.svg'),
    new Tool('name', '../../../assets/icons/undo.svg'),
    new Tool('name', '../../../assets/icons/redo.svg')
  ];

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
            this.toolboxFacadeService.setUndo();
          }
          break;
        }
        case HOTKEYS.KEY_CTRL_Y_REDO: {
          if (this.commandOrCtrlPressed(event)) {
            this.toolboxFacadeService.setRedo();
          }
          break;
        }
      }
    }
  }

  public commandOrCtrlPressed(event: KeyboardEvent): boolean {
    return navigator.platform.indexOf('Mac') === -1 ? event.ctrlKey : event.metaKey;
  }

}
