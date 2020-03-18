import { Component } from '@angular/core';
import { EditorService } from 'src/app/shared/services/Editor/editor.service';

const SIZE = 80;

@Component({
  selector: 'app-zoom',
  templateUrl: './zoom.component.html',
  styleUrls: ['./zoom.component.scss']
})
export class ZoomComponent {

  mouseDown: boolean;

  constructor(public editorService: EditorService) {
      this.mouseDown = false;
  }

  public setDimensions(): any {
    const styles = {
      // CSS property names
      height: SIZE + 'px',
      width: (SIZE * this.editorService.originalImageRatio()) + 'px',
      transform: 'scaleX(' + this.editorService.scaleX + ')'
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
    // console.log('onTouchEnd(event: TouchEvent)');
    this.mouseDown = event.targetTouches.length === 0;
  }

  moveEvent(clientX: number, clientY: number): void {
    // console.log('moveEvent(clientX: number, clientY: number)');

    const zoomCanvas = document.getElementById('zoom-canvas') as HTMLCanvasElement;
    // console.log('moveEvent::zoomCanvas ==> ' + zoomCanvas);

    const zoomCanvasRect = zoomCanvas.getBoundingClientRect();
    // console.log('moveEvent::zoomCanvasRect ==> ' + zoomCanvasRect);

    // tslint:disable-next-line: max-line-length
    const percentX = this.editorService.scaleX === 1 ? (clientX - zoomCanvasRect.left) / zoomCanvasRect.width : 1 - (clientX - zoomCanvasRect.left) / zoomCanvasRect.width;
    // console.log('percentX ==> ' + percentX);

    const percentY = (clientY - zoomCanvasRect.top) / zoomCanvasRect.height;
    // console.log('percentY ==> ' + percentY);

    this.editorService.moveCenter(percentX, percentY);
  }

}
