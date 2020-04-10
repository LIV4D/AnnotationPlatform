import { Injectable } from '@angular/core';
import { LayersService } from './../../../shared/services/Editor/layers.service';
import { EditorService } from './../../../shared/services/Editor/editor.service';
import { ToolPropertiesService } from 'src/app/shared/services/Editor/tool-properties.service';
import { ToolboxService } from 'src/app/shared/services/Editor/toolbox.service';

@Injectable({
    providedIn: 'root'
})
export class LayersFacadeService {

    constructor(private layersService: LayersService, private editorService: EditorService,
                public toolPropertiesService: ToolPropertiesService, public toolboxService: ToolboxService) {}

    public init() {
        this.layersService.init();
    }

    // Layers service
    get mousePositionInDisplayCoordinates(){
       return this.layersService.mousePositionInDisplayCoordinates;
    }

    set mousePositionInDisplayCoordinates(mousePositionInDisplayCoordinates){
        this.layersService.mousePositionInDisplayCoordinates = mousePositionInDisplayCoordinates;
    }

    get lastPoint(){
        return this.layersService.lastPoint;
    }

    set lastPoint(lastPoint){
        this.layersService.lastPoint = lastPoint;
    }

    /// Editor service
    get canvasDisplayRatio(){
        return this.editorService.canvasDisplayRatio;
    }

    get scaleX(){
        return this.editorService.scaleX;
    }

    get viewPort(){
        return this.editorService.viewPort;
    }

    // Tool properties service
    get brushWidthChanged(){
        return this.toolPropertiesService.brushWidthChanged;
    }

    get brushWidth(){
        return this.toolPropertiesService.brushWidth;
    }

    // Toolbox service
    get selectedTool(){
        return this.toolboxService.selectedTool;
    }
}
