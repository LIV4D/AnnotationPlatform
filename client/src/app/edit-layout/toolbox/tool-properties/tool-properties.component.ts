import { Tool } from './../../../model/tool';
import { ToolboxService } from './../toolbox.service';
import { Component, OnInit } from '@angular/core';
import { getParentRenderElement } from '@angular/core/src/view/util';
import { ToolPropertiesService } from './tool-properties.service';

@Component({
  selector: 'app-tool-properties',
  templateUrl: './tool-properties.component.html',
  styleUrls: ['./tool-properties.component.scss']
})
export class ToolPropertiesComponent implements OnInit {

    selectedTool: Tool;
    sliderValue: number;
    eraseAll: boolean;
    smartMask: boolean;

    constructor(private toolboxService: ToolboxService, private toolPropertiesService: ToolPropertiesService) {
        this.eraseAll = false;
        this.smartMask = false;
        toolboxService.setToolPropertiesComponent(this);
     }

    ngOnInit(): void {
        this.toolboxService.selectedTool.subscribe(
        value => {
            this.selectedTool = value;
        });
        this.sliderValue = this.toolPropertiesService.brushWidth;
    }

    handleSliderChange(event: any): void {
        this.toolPropertiesService.SetBrushWidth(event.value);
        this.sliderValue = event.value;
    }

    handleWheelChange(event: WheelEvent): void {
        let newSize = Math.max(1, Math.min(100, this.sliderValue-event.deltaY));
       
        this.toolPropertiesService.SetBrushWidth(newSize);
        this.sliderValue = newSize;
    }

    toggleEraseAll(): void {
        this.eraseAll = !this.eraseAll;
        this.toolPropertiesService.SetEraseAll(this.eraseAll);
    }

    toggleSmartMask(): void{
        this.smartMask =!this.smartMask;
        this.toolPropertiesService.SetSmartMask(this.smartMask);
    }
}
