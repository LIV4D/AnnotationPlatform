import { Component, OnInit, ViewChild, ElementRef, ViewContainerRef, ComponentFactoryResolver, AfterViewInit } from '@angular/core';
import { LayersFacadeService } from './../layers/layers.facade.service';
import { Tool } from './../../../shared/services/Editor/Tools/tool.service';
import { Point } from './../../../shared/services/Editor/Tools/point.service';
import { TOOL_NAMES } from './../../../shared/constants/tools';
import { CommentBoxComponent } from '../../comment-box/comment-box.component';

@Component({
  selector: 'app-layers',
  templateUrl: './layers.component.html',
  styleUrls: ['./layers.component.scss']
})
export class LayersComponent implements OnInit, AfterViewInit {

  // ngOnInit(): void {
  //   // console.log('LayersComponent::ngOnInit()');
  //   this.layersFacadeService.init();

  //   // this.editorService.canvasDisplayRatio.subscribe(
  //   //     value => {
  //   //         this.updateCursorRadius();
  //   //     });
  //   // this.toolPropertiesService.brushWidthChanged.subscribe(() => { this.updateCursorRadius(); });
  //   // this.toolboxService.selectedTool.subscribe(value => this.updateMouseCursor(value));
  // }


    @ViewChild('svgContainer') svgContainer: ElementRef;
    @ViewChild('mouseCursor') mouseCursor: ElementRef;
    @ViewChild('dashStroke') dashStroke: ElementRef;

    constructor(
        private layersFacadeService: LayersFacadeService,
    ) {
    }

    ngOnInit(): void { }

    ngAfterViewInit(): void {
        /* All this was in ngOninit */
        this.layersFacadeService.init();
        this.layersFacadeService.canvasDisplayRatio.subscribe(
            value => {
                this.updateCursorRadius();
            });
        this.layersFacadeService.brushWidthChanged.subscribe(() => { this.updateCursorRadius(); });
        this.layersFacadeService.selectedTool.subscribe(value => this.updateMouseCursor(value));
        /*  */
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
        if (this.layersFacadeService.mousePositionInDisplayCoordinates) {
            this.mouseCursor.nativeElement.setAttribute('stroke', 'black');
            this.updateCursorRadius();
            this.setCursorPosition(this.layersFacadeService.mousePositionInDisplayCoordinates);
        }
    }

    setCursorPosition(point: Point): void {
        this.mouseCursor.nativeElement.setAttribute('cx', point.x.toString());
        this.mouseCursor.nativeElement.setAttribute('cy', point.y.toString());
    }

    onMouseIn(event: MouseEvent): void {
        const selectedToolName = this.layersFacadeService.selectedTool.getValue().name;
        this.layersFacadeService.mousePositionInDisplayCoordinates = this.getPoint(new Point(event.clientX, event.clientY));
        if (selectedToolName === TOOL_NAMES.BRUSH || selectedToolName === TOOL_NAMES.ERASER) {
            this.showMouseCursor();
        }
    }

    onTouchStart(event: TouchEvent): void{
        const touch = event.targetTouches[0];
        const selectedToolName = this.layersFacadeService.selectedTool.getValue().name;
        this.layersFacadeService.mousePositionInDisplayCoordinates = this.getPoint(new Point(touch.clientX, touch.clientY));
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
        if (this.layersFacadeService.lastPoint) {
            const point = this.getPoint(new Point(event.clientX, event.clientY));
            this.layersFacadeService.lastPoint = point;
            this.setDashStrokePosition(point);
        }
    }

    onMouseLeave(event: MouseEvent): void {
        this.hideMouseCursor();
        this.layersFacadeService.mousePositionInDisplayCoordinates = null;
    }

    onTouchEnd(event: TouchEvent): void{
        const touch = event.targetTouches[0];
        if (this.layersFacadeService.lastPoint) {
            const point = this.getPoint(new Point(touch.clientX, touch.clientY));
            this.layersFacadeService.lastPoint = point;
            this.setDashStrokePosition(point);
        }
        this.hideMouseCursor();
        this.layersFacadeService.mousePositionInDisplayCoordinates = null;
    }

    cursorMoveEvent(clientPoint: Point): void {
        const selectedToolName = this.layersFacadeService.selectedTool.getValue().name;
        const point = this.getPoint(clientPoint);
        if (selectedToolName === TOOL_NAMES.BRUSH || selectedToolName === TOOL_NAMES.ERASER) {
            this.setCursorPosition(new Point(point.x, point.y));
        }
        if (this.layersFacadeService.lastPoint) {
            this.setDashStrokePosition(point);
        }
        this.layersFacadeService.mousePositionInDisplayCoordinates = new Point(point.x, point.y);
    }

    updateCursorRadius(): void {
        const r = this.layersFacadeService.brushWidth / 2 * this.layersFacadeService.canvasDisplayRatio.getValue();
        if (r) {
            this.mouseCursor.nativeElement.setAttribute('r', (r).toString());
        }
    }

    setDashStrokePosition(point: Point): void {
        this.dashStroke.nativeElement.setAttribute('x1', this.layersFacadeService.lastPoint.x.toString());
        this.dashStroke.nativeElement.setAttribute('y1', this.layersFacadeService.lastPoint.y.toString());
        this.dashStroke.nativeElement.setAttribute('x2', point.x.toString());
        this.dashStroke.nativeElement.setAttribute('y2', point.y.toString());
    }

    getPoint(clientPoint: Point): Point {
        const x = this.layersFacadeService.scaleX === 1 ?
            Math.ceil(clientPoint.x - this.svgContainer.nativeElement.getBoundingClientRect().left) :
            this.layersFacadeService.viewPort.clientWidth -
            (Math.ceil(clientPoint.x - this.svgContainer.nativeElement.getBoundingClientRect().left));
        const y = Math.ceil(clientPoint.y - this.svgContainer.nativeElement.getBoundingClientRect().top);
        return new Point(x, y);
    }

}
