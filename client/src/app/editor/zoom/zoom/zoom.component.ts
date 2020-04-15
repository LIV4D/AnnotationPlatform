import { Component } from '@angular/core';
import { EditorService } from 'src/app/shared/services/Editor/editor.service';
import { CanvasDimensionService } from 'src/app/shared/services/Editor/canvas-dimension.service';

const SIZE = 80;

@Component({
  selector: 'app-zoom',
  templateUrl: './zoom.component.html',
  styleUrls: ['./zoom.component.scss']
})
export class ZoomComponent {

  mouseDown: boolean;

  constructor(public editorService: EditorService, private canvasDimensionService: CanvasDimensionService) {
      this.mouseDown = false;
  }

  public setDimensions(): any {
    const styles = {
      // CSS property names
      height: SIZE + 'px',
      width: (SIZE * this.canvasDimensionService.originalImageRatio()) + 'px',
      transform: 'scaleX(' + this.canvasDimensionService.scaleX + ')'
    };
    return styles;
  }

  onMouseUp(event: MouseEvent): void {
    // console.log('onMouseUp(event: MouseEvent)');
    this.mouseDown = false;
  }

  onMouseLeave(event: MouseEvent): void {
    // console.log('onMouseLeave(event: MouseEvent)');
    this.mouseDown = false;
  }

  onMouseDown(event: MouseEvent): void {
    // console.log('onMouseDown(event: MouseEvent)');
    this.moveEvent(event.clientX, event.clientY);
    this.mouseDown = true;
  }

  onMouseMove(event: MouseEvent): void {
    // console.log('onMouseMove(event: MouseEvent)');
    if (this.mouseDown) {
        this.moveEvent(event.clientX, event.clientY);
    }
  }

  onTouchStart(event: TouchEvent): void {
    // console.log('onTouchStart(event: TouchEvent)');
    const touch = event.targetTouches[0];
    this.mouseDown = true;
    this.moveEvent(touch.clientX, touch.clientY);
  }

  onTouchMove(event: TouchEvent): void {
    // console.log('onTouchMove(event: TouchEvent)');
    if (this.mouseDown) {
        const touch = event.targetTouches[0];
        this.moveEvent(touch.clientX, touch.clientY);
    }
  }

  onTouchEnd(event: TouchEvent): void {
    this.mouseDown = event.targetTouches.length === 0;
  }

  moveEvent(clientX: number, clientY: number): void {

    const zoomCanvas = document.getElementById('zoom-canvas') as HTMLCanvasElement;

    const zoomCanvasRect = zoomCanvas.getBoundingClientRect();

    // tslint:disable-next-line: max-line-length
    const percentX = this.canvasDimensionService.scaleX === 1 ? (clientX - zoomCanvasRect.left) / zoomCanvasRect.width : 1 - (clientX - zoomCanvasRect.left) / zoomCanvasRect.width;

    const percentY = (clientY - zoomCanvasRect.top) / zoomCanvasRect.height;

    this.canvasDimensionService.moveCenter(percentX, percentY);
  }

}
