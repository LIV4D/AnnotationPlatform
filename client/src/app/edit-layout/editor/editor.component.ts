import { AppService } from './../../app.service';
import { TOOL_NAMES } from './../toolbox/toolbox.service';
import { Point } from './../../model/point';
import { element } from 'protractor';
import { map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { OnDestroy, Component, OnInit, ViewChild, Input } from '@angular/core';
import { ToolboxService } from '../toolbox/toolbox.service';
import { Output } from '@angular/core';
import { EventEmitter } from '@angular/core';
import { EditorService } from './editor.service';
import { ToolPropertiesComponent } from './../toolbox/tool-properties/tool-properties.component';

@Component({
    selector: 'app-editor',
    templateUrl: './editor.component.html',
    styleUrls: ['./editor.component.scss']
})

export class EditorComponent implements OnInit, OnDestroy {
    constructor(private toolboxService: ToolboxService, public editorService: EditorService, public appService: AppService) { }

    image: HTMLImageElement;
    zoomFactor: number;
    offsetX: number;
    offsetY: number;
    @ViewChild('editorBox') viewPort: any;
    mouseDown = false;
    middleMouseDown = false;

    @Output() svgLoaded: EventEmitter<any> = new EventEmitter();

    ngOnInit(): void {
        this.editorService.init(this.svgLoaded);
        this.toolboxService.listOfTools.filter((tool) => tool.name === TOOL_NAMES.UNDO)[0].disabled = true;
        this.toolboxService.listOfTools.filter((tool) => tool.name === TOOL_NAMES.REDO)[0].disabled = true;
    }

    ngOnDestroy(): void {
        this.editorService.imageServer = null;
        this.image = null;
        this.mouseDown = false;
        this.middleMouseDown = false;
    }

    onMouseDown(event: MouseEvent): void {
        this.mouseDown = true;
        if (event.which === 2 && !this.editorService.menuState){
            const panTool = this.toolboxService.listOfTools.filter((tool) => tool.name === TOOL_NAMES.PAN)[0];
            panTool.onMouseDown(this.getMousePositionInCanvasSpace(new Point(event.clientX, event.clientY)));
            this.middleMouseDown = true;
        }
        else if (event.which === 1 && !this.editorService.menuState  && !this.middleMouseDown) {
            this.toolboxService.onMouseDown(this.getMousePositionInCanvasSpace(new Point(event.clientX, event.clientY)));
        }
        this.enableKeyEvents(false);
    }

    onTouchStart(event: TouchEvent): void{
        const touch = event.targetTouches[0];
        this.mouseDown = true;
        this.toolboxService.onMouseDown(this.getMousePositionInCanvasSpace(new Point(touch.clientX, touch.clientY)));
        this.enableKeyEvents(false);
    }

    onMouseUp(event: MouseEvent): void {
        this.mouseDown = false;
        if (event.which === 2 && !this.editorService.menuState){
            const panTool = this.toolboxService.listOfTools.filter((tool) => tool.name === TOOL_NAMES.PAN)[0];
            panTool.onMouseUp();
            this.middleMouseDown = false;
        }
        else if (!this.middleMouseDown){
            this.toolboxService.onMouseUp();
        }
        this.enableKeyEvents(true);
        
    }

    onTouchEnd(event: TouchEvent): void{
        this.mouseDown = false;
        this.toolboxService.onMouseUp();
        this.enableKeyEvents(true);
    }

    onMouseMove(event: MouseEvent): void {
        if (this.middleMouseDown){
            const panTool = this.toolboxService.listOfTools.filter((tool) => tool.name === TOOL_NAMES.PAN)[0];
            panTool.onMouseMove(this.getMousePositionInCanvasSpace(new Point(event.clientX, event.clientY)));
        }
        else{
            this.toolboxService.onMouseMove(this.getMousePositionInCanvasSpace(new Point(event.clientX, event.clientY)));
        }
    }

    onTouchMove(event: TouchEvent): void{
        const touch = event.targetTouches[0];
        this.toolboxService.onMouseMove(this.getMousePositionInCanvasSpace(new Point(touch.clientX, touch.clientY)));
    }

    onMouseLeave(event: MouseEvent): void {
        this.mouseDown = false;
        this.toolboxService.onMouseOut(this.getMousePositionInCanvasSpace(new Point(event.clientX, event.clientY)));
        this.enableKeyEvents(true);
    }

    onMouseWheel(event: WheelEvent): void {
        if (!this.mouseDown && !this.editorService.layersService.firstPoint && event.ctrlKey==false) {
            const position = this.getMousePositionInCanvasSpace(new Point(event.clientX, event.clientY));
            this.editorService.zoom(-event.deltaY / 300, position);
        }
        else if(!this.mouseDown && !this.editorService.layersService.firstPoint){
            // var delta = Math.max(-1, Math.min(1, (event.wheelDelta || -event.detail)));
            this.toolboxService.getToolPropertiesComponent().handleWheelChange(event);
        }
    }

    flip(): void {
        this.editorService.scaleX *= -1;
    }

    onResize(): void {
        this.editorService.resize();
    }

    getMousePositionInCanvasSpace(clientPosition: Point): Point {
        if (!this.editorService.backgroundCanvas) { return undefined; }
        let clientX: number;
        let clientY: number;
        // X coordinate is adjusted if the image is flipped horizontally.
        clientX = this.editorService.scaleX === 1
            ? clientPosition.x - this.viewPort.nativeElement.getBoundingClientRect().left
            : this.viewPort.nativeElement.clientWidth - clientPosition.x + this.viewPort.nativeElement.getBoundingClientRect().left;

        clientY = clientPosition.y - this.viewPort.nativeElement.getBoundingClientRect().top;
        const canvasX = clientX * this.editorService.backgroundCanvas.displayCanvas.width /
            this.editorService.backgroundCanvas.displayCanvas.getBoundingClientRect().width;
        const canvasY = clientY * this.editorService.backgroundCanvas.displayCanvas.height /
            this.editorService.backgroundCanvas.displayCanvas.getBoundingClientRect().height;
        return new Point(canvasX, canvasY);
    }

    enableKeyEvents(enable: boolean): void {
        if (this.editorService.layersService.firstPoint) {
            this.appService.keyEventsEnabled = false;
        } else {
            this.appService.keyEventsEnabled = enable;
        }
    }
}
