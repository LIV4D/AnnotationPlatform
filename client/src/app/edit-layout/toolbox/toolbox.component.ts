import { Eraser } from './../../model/eraser';
import { AppService } from './../../app.service';
import { HOTKEYS } from './../../hotkeys';
import { Component, OnInit } from '@angular/core';
import { ToolboxService, TOOL_NAMES } from './toolbox.service';

@Component({
    selector: 'app-toolbox',
    templateUrl: './toolbox.component.html',
    styleUrls: ['./toolbox.component.scss']
})
export class ToolBoxComponent implements OnInit {

    constructor(public toolboxService: ToolboxService, public appService: AppService) { }

    ngOnInit(): void {
    }

    public onKeyDown(event: KeyboardEvent): void {
        if (this.appService.keyEventsEnabled) {
            switch (event.keyCode) {
                case HOTKEYS.KEY_P_PAN: {
                    this.toolboxService.setSelectedTool(
                        this.toolboxService.listOfTools.filter((tool) => tool.name === TOOL_NAMES.PAN)[0]
                    );
                    break;
                }
                case HOTKEYS.KEY_E_ERASER: {
                    this.toolboxService.setSelectedTool(
                        this.toolboxService.listOfTools.filter((tool) => tool.name === TOOL_NAMES.ERASER)[0]
                    );
                    break;
                }
                case HOTKEYS.KEY_G_LASSO_ERASER: {
                    this.toolboxService.setSelectedTool(
                        this.toolboxService.listOfTools.filter((tool) => tool.name === TOOL_NAMES.LASSO_ERASER)[0]
                    );
                    break;
                }
                case HOTKEYS.KEY_B_BRUSH: {
                    this.toolboxService.setSelectedTool(
                        this.toolboxService.listOfTools.filter((tool) => tool.name === TOOL_NAMES.BRUSH)[0]
                    );
                    break;
                }
                case HOTKEYS.KEY_F_FILL_BRUSH: {
                    this.toolboxService.setSelectedTool(
                        this.toolboxService.listOfTools.filter((tool) => tool.name === TOOL_NAMES.FILL_BRUSH)[0]
                    );
                    break;
                }
                case HOTKEYS.KEY_V_FILL_VECTOR: {
                    this.toolboxService.setSelectedTool(
                        this.toolboxService.listOfTools.filter((tool) => tool.name === TOOL_NAMES.FILL_VECTOR)[0]
                    );
                    break;
                }
                case HOTKEYS.KEY_L_PICKKER: {
                    this.toolboxService.setSelectedTool(
                        this.toolboxService.listOfTools.filter((tool) => tool.name === TOOL_NAMES.BIO_PICKER)[0]
                    );
                    break;
                }
                case HOTKEYS.KEY_CTRL_Z_UNDO: {
                    if (this.commandOrCtrlPressed(event)) {
                        this.toolboxService.setSelectedTool(
                            this.toolboxService.listOfTools.filter((tool) => tool.name === TOOL_NAMES.UNDO)[0]
                        );
                        this.toolboxService.setUndoRedoState();
                    }
                    break;
                }
                case HOTKEYS.KEY_CTRL_Y_REDO: {
                    if (this.commandOrCtrlPressed(event)) {
                        this.toolboxService.setSelectedTool(
                            this.toolboxService.listOfTools.filter((tool) => tool.name === TOOL_NAMES.REDO)[0]
                        );
                        this.toolboxService.setUndoRedoState();
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
