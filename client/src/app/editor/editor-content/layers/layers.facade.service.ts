import { Injectable } from '@angular/core';
import { LayersService } from '../../../shared/services/editor/layers.service';
import { EditorService } from '../../../shared/services/editor/editor.service';
import { ToolPropertiesService } from 'src/app/shared/services/editor/tool-properties.service';
import { ToolboxService } from 'src/app/shared/services/editor/toolbox.service';
import { CanvasDimensionService } from 'src/app/shared/services/editor/canvas-dimension.service';
import { ViewportService } from 'src/app/shared/services/editor/viewport.service';

@Injectable({
    providedIn: 'root'
})
export class LayersFacadeService {

    constructor(private layersService: LayersService, private editorService: EditorService, public canvasDimensionService: CanvasDimensionService,
                public toolPropertiesService: ToolPropertiesService, public toolboxService: ToolboxService, public viewPortService: ViewportService) {}

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
        return this.canvasDimensionService.canvasDisplayRatio;
    }

    get scaleX(){
        return this.canvasDimensionService.scaleX;
    }

    get viewPort(){
        return this.viewPortService.viewPort;
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
