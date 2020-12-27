import { Tool } from '../../../../shared/services/editor/tools/tool.service';
import { ToolboxFacadeService } from '../toolbox.facade.service';
import { Component, OnInit } from '@angular/core';
import { ToolPropertiesFacadeService } from './tool-properties.facade.service';
import { AppService } from '../../../../shared/services/app.service';
import { MatSlider } from '@angular/material/slider';
import { CamelCaseToTextPipe } from '../../../../shared/pipes/camel-case-to-text.pipe';

@Component({
  selector: 'app-tool-properties',
  templateUrl: './tool-properties.component.html',
  styleUrls: ['./tool-properties.component.scss']
})
export class ToolPropertiesComponent implements OnInit {

    selectedTool: Tool;
    eraserSize: number;
    brushSize: number;
    eraseAll: boolean;
    smartMask: boolean;

    constructor(private toolboxFacadeService: ToolboxFacadeService, public toolPropertiesFacadeService: ToolPropertiesFacadeService,
                public appService: AppService) {
        this.eraseAll = true;
        this.smartMask = false;
        this.eraserSize = 25;
        this.brushSize = 10;
        this.toolPropertiesFacadeService.brushWidthChanged.subscribe( (v) => { this.sliderValue = v; });
     }

    ngOnInit(): void {
        this.toolboxFacadeService.selectedTool.subscribe(
        value => {
            this.selectedTool = value;
            if (this.selectedTool !== undefined && this.selectedTool.name === 'brush' || this.selectedTool.name === 'eraser') {
                this.toolPropertiesFacadeService.setBrushWidth(this.sliderValue);
            }
        });
    }

    handleSliderChange(event: any): void {
        this.toolPropertiesFacadeService.setBrushWidth(event.value);
    }

    get sliderValue(): number {
        return this.selectedTool !== undefined && this.selectedTool.name === 'eraser' ? this.eraserSize : this.brushSize;
    }

    set sliderValue(s: number) {
        if (this.selectedTool !== undefined && this.selectedTool.name === 'eraser') {
            this.eraserSize = s;
        } else {
            this.brushSize = s;
        }
    }

    toggleEraseAll(): void {
        this.eraseAll = !this.eraseAll;
        this.toolPropertiesFacadeService.SetEraseAll(this.eraseAll);
    }

    toggleSmartMask(): void {
        this.smartMask = !this.smartMask;
        this.toolPropertiesFacadeService.SetSmartMask(this.smartMask);
    }

    togglePressure(): void {
        this.toolPropertiesFacadeService.setEnableBrushMultiplier(!this.toolPropertiesFacadeService.enableBrushMultiplier);
    }
}
