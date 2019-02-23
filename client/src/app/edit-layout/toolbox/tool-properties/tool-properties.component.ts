import { Tool } from './../../../model/tool';
import { ToolboxService } from './../toolbox.service';
import { Component, OnInit } from '@angular/core';
import { getParentRenderElement } from '@angular/core/src/view/util';
import { ToolPropertiesService } from './tool-properties.service';
import { Observable, BehaviorSubject } from 'rxjs';
import { AppService } from 'src/app/app.service';

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

    constructor(private toolboxService: ToolboxService, private toolPropertiesService: ToolPropertiesService, 
                public appService: AppService) {
        this.eraseAll = true;
        this.smartMask = false;
        this.eraserSize = 25;
        this.brushSize = 10;
        // toolboxService.setToolPropertiesComponent(this);
        this.toolPropertiesService.brushWidthChanged.subscribe( (v) => { this.sliderValue = v; });
     }

    ngOnInit(): void {
        this.toolboxService.selectedTool.subscribe(
        value => {
            this.selectedTool = value;
            if (this.selectedTool !== undefined && this.selectedTool.name === 'brush' || this.selectedTool.name === 'eraser') {
                this.toolPropertiesService.setBrushWidth(this.sliderValue);
            }
        });
    }

    handleSliderChange(event: any): void {
        this.toolPropertiesService.setBrushWidth(event.value);
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
        this.toolPropertiesService.SetEraseAll(this.eraseAll);
    }

    toggleSmartMask(): void {
        this.smartMask = !this.smartMask;
        this.toolPropertiesService.SetSmartMask(this.smartMask);
    }

    togglePressure(): void {
        this.toolPropertiesService.setEnableBrushMultiplier(!this.toolPropertiesService.enableBrushMultiplier);
    }
}
