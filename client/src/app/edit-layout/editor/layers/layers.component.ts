import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { LayersService } from './layers.service';
import { ToolPropertiesService } from '../../toolbox/tool-properties/tool-properties.service';
import { ToolboxService } from '../../toolbox/toolbox.service';
import { EditorService } from '../editor.service';
import { Point } from '../../../model/point';
import { Tool } from '../../../model/tool';
import { TOOL_NAMES } from '../../toolbox/toolbox.service';

@Component({
    selector: 'app-layers',
    templateUrl: './layers.component.html',
    styleUrls: ['./layers.component.scss']
})
export class LayersComponent implements OnInit {

    @ViewChild('svgContainer') svgContainer: ElementRef;
    @ViewChild('mouseCursor') mouseCursor: ElementRef;
    @ViewChild('dashStroke') dashStroke: ElementRef;

    constructor(
        private layersService: LayersService,
        private toolPropertiesService: ToolPropertiesService,
        private toolboxService: ToolboxService,
        private editorService: EditorService
    ) {
    }

    ngOnInit(): void {
        this.layersService.init();
        this.editorService.canvasDisplayRatio.subscribe(
            value => {
                this.updateCursorRadius();
            });
        this.toolPropertiesService.brushWidthChanged.subscribe(() => { this.updateCursorRadius(); });
        this.toolboxService.selectedTool.subscribe(value => this.updateMouseCursor(value));
    }

    updateMouseCursor(tool: Tool): void {
        if (tool.name === TOOL_NAMES.BRUSH || tool.name === TOOL_NAMES.ERASER) {
            this.showMouseCursor();
        } else {
            this.hideMouseCursor();
        }
    }

    hideMouseCursor(): void {
        this.mouseCursor.nativeElement.setAttribute('stroke', 'transparent');
    }

    showMouseCursor(): void {
        if (this.layersService.mousePositionInDisplayCoordinates) {
            this.mouseCursor.nativeElement.setAttribute('stroke', 'black');
            this.updateCursorRadius();
            this.setCursorPosition(this.layersService.mousePositionInDisplayCoordinates);
        }
    }

    setCursorPosition(point: Point): void {
        this.mouseCursor.nativeElement.setAttribute('cx', point.x.toString());
        this.mouseCursor.nativeElement.setAttribute('cy', point.y.toString());
    }

    onMouseIn(event: MouseEvent): void {
        const selectedToolName = this.toolboxService.selectedTool.getValue().name;
        this.layersService.mousePositionInDisplayCoordinates = this.getPoint(new Point(event.clientX, event.clientY));
        if (selectedToolName === TOOL_NAMES.BRUSH || selectedToolName === TOOL_NAMES.ERASER) {
            this.showMouseCursor();
        }
    }

    onTouchStart(event: TouchEvent): void{
        const touch = event.targetTouches[0];
        const selectedToolName = this.toolboxService.selectedTool.getValue().name;
        this.layersService.mousePositionInDisplayCoordinates = this.getPoint(new Point(touch.clientX, touch.clientY));
        if (selectedToolName === TOOL_NAMES.BRUSH || selectedToolName === TOOL_NAMES.ERASER) {
            this.showMouseCursor();
        }
    }

    onMouseMove(event: MouseEvent): void {
        this.cursorMoveEvent(new Point(event.clientX, event.clientY));
    }

    onTouchMove(event: TouchEvent): void{
        const touch = event.targetTouches[0];
        this.cursorMoveEvent(new Point(touch.clientX, touch.clientY));
    }

    onMouseUp(event: MouseEvent): void {
        if (this.layersService.lastPoint) {
            const point = this.getPoint(new Point(event.clientX, event.clientY));
            this.layersService.lastPoint = point;
            this.setDashStrokePosition(point);
        }
    }

    onMouseLeave(event: MouseEvent): void {
        this.hideMouseCursor();
        this.layersService.mousePositionInDisplayCoordinates = null;
    }

    onTouchEnd(event: TouchEvent): void{
        const touch = event.targetTouches[0];
        if (this.layersService.lastPoint) {
            const point = this.getPoint(new Point(touch.clientX, touch.clientY));
            this.layersService.lastPoint = point;
            this.setDashStrokePosition(point);
        }
        this.hideMouseCursor();
        this.layersService.mousePositionInDisplayCoordinates = null;
    }

    cursorMoveEvent(clientPoint: Point): void {
        const selectedToolName = this.toolboxService.selectedTool.getValue().name;
        const point = this.getPoint(clientPoint);
        if (selectedToolName === TOOL_NAMES.BRUSH || selectedToolName === TOOL_NAMES.ERASER) {
            this.setCursorPosition(new Point(point.x, point.y));
        }
        if (this.layersService.lastPoint) {
            this.setDashStrokePosition(point);
        }
        this.layersService.mousePositionInDisplayCoordinates = new Point(point.x, point.y);
    }

    updateCursorRadius(): void {
        const r = this.toolPropertiesService.brushWidth / 2 * this.editorService.canvasDisplayRatio.getValue();
        if (r) {
            this.mouseCursor.nativeElement.setAttribute('r', (r).toString());
        }
    }

    setDashStrokePosition(point: Point): void {
        this.dashStroke.nativeElement.setAttribute('x1', this.layersService.lastPoint.x.toString());
        this.dashStroke.nativeElement.setAttribute('y1', this.layersService.lastPoint.y.toString());
        this.dashStroke.nativeElement.setAttribute('x2', point.x.toString());
        this.dashStroke.nativeElement.setAttribute('y2', point.y.toString());
    }

    getPoint(clientPoint: Point): Point {
        const x = this.editorService.scaleX === 1 ?
            Math.ceil(clientPoint.x - this.svgContainer.nativeElement.getBoundingClientRect().left) :
            this.editorService.viewPort.clientWidth -
            (Math.ceil(clientPoint.x - this.svgContainer.nativeElement.getBoundingClientRect().left));
        const y = Math.ceil(clientPoint.y - this.svgContainer.nativeElement.getBoundingClientRect().top);
        return new Point(x, y);
    }
}
