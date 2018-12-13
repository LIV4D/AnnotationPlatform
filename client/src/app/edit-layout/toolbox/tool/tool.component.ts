import { ToolboxService } from './../toolbox.service';
import { Tool } from './../../../model/tool';
import { Component, OnInit, Input } from '@angular/core';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
    selector: 'app-tool',
    templateUrl: './tool.component.html',
    styleUrls: ['./tool.component.scss']
})
export class ToolComponent implements OnInit {

    @Input() tool: Tool;
    isSelected: Boolean = false;
    showDelay: number;
    disabled = false;
    constructor(private toolboxService: ToolboxService) {
        this.showDelay = 1000;
    }

    ngOnInit(): void {
        this.toolboxService.selectedTool.subscribe(
            value => {
                this.isSelected = value === this.tool;
            });
    }

    selectTool(): void {
        this.toolboxService.setSelectedTool(this.tool);
    }

    public onMouseUp(event: MouseEvent): void {
        // setTimeout necessary or else it will happen on next mouse up
        setTimeout(() => {
            this.toolboxService.setUndoRedoState();
        }, 0);
    }
}
