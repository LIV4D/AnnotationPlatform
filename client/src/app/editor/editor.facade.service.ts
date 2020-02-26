import { Injectable, EventEmitter } from '@angular/core';
import { EditorService } from './../shared/services/Editor/editor.service';
import { Point } from './../shared/models/point.model';
import { ToolboxService } from './../shared/services/Editor/toolbox.service';
import { TOOL_NAMES } from './../shared/constants/tools';

@Injectable()
export class EditorFacadeService {

    constructor(private editorService: EditorService, private toolboxService: ToolboxService) { }

    init(svgLoaded: EventEmitter<any>): void {
        this.editorService.init(svgLoaded);
    }

    zoom(delta: number, position: Point = null): void {
        this.editorService.zoom(delta, position);
    }

    get firstPoint() {
        return this.editorService.layersService.firstPoint;
    }

    get backgroundCanvas() {
        return this.editorService.backgroundCanvas;
    }

    get scaleX() {
        return this.editorService.scaleX;
    }

    get panTool() {
        return this.toolboxService.listOfTools.filter((tool) => tool.name === TOOL_NAMES.PAN)[0];
    }

    get menuState() {
        return this.editorService.menuState;
    }

    public onCursorMoveToolbox(point: Point): void {
        this.toolboxService.onCursorMove(point);
    }

    public onCursorDownToolbox(point: Point): void {
        this.toolboxService.onCursorDown(point);
    }

    public onCursorUpToolbox(): void {
        this.toolboxService.onCursorUp();
    }

    public onCursorOutToolbox(point: Point): void {
        this.toolboxService.onCursorOut(point);
    }

}
