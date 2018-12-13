import { EditorService } from './../editor.service';
import { AfterViewChecked, ViewChild } from '@angular/core';
import { Component, OnInit, Input, AfterViewInit } from '@angular/core';

const SIZE = 80;
@Component({
    selector: 'app-zoom',
    templateUrl: './zoom.component.html',
    styleUrls: ['./zoom.component.scss']
})
export class ZoomComponent implements OnInit {
    mouseDown: boolean;

    constructor(public editorService: EditorService) {
        this.mouseDown = false;
    }

    ngOnInit(): void {
    }

    public setDimensions(): any {
        const styles = {
            // CSS property names
            'height': SIZE + 'px',
            'width': (SIZE * this.editorService.originalImageRatio()) + 'px',
            'transform': 'scaleX(' + this.editorService.scaleX + ')'
        };
        return styles;
    }

    onMouseUp(event: MouseEvent): void {
        this.mouseDown = false;
    }

    onMouseLeave(event: MouseEvent): void {
        this.mouseDown = false;
    }

    onMouseDown(event: MouseEvent): void {
        this.moveEvent(event.clientX, event.clientY);
        this.mouseDown = true;
    }

    onMouseMove(event: MouseEvent): void {
        if (this.mouseDown) {
            this.moveEvent(event.clientX, event.clientY);
        }
    }

    onTouchStart(event: TouchEvent): void{
        const touch = event.targetTouches[0];
        this.mouseDown = true;
        this.moveEvent(touch.clientX, touch.clientY);
    }

    onTouchMove(event: TouchEvent): void{
        if(this.mouseDown){
            const touch = event.targetTouches[0];
            this.moveEvent(touch.clientX, touch.clientY)
        }
    }

    onTouchEnd(event: TouchEvent): void{
        this.mouseDown = event.targetTouches.length==0;
    }

    moveEvent(clientX: number, clientY: number): void{
        const zoomCanvas = document.getElementById('zoom-canvas') as HTMLCanvasElement;
        const zoomCanvasRect = zoomCanvas.getBoundingClientRect();
        const percentX = this.editorService.scaleX === 1 ?
        (clientX - zoomCanvasRect.left) / zoomCanvasRect.width :
        1 - (clientX - zoomCanvasRect.left) / zoomCanvasRect.width;
        const percentY = (clientY - zoomCanvasRect.top) / zoomCanvasRect.height;
        this.editorService.moveCenter(percentX, percentY);
    }
}
