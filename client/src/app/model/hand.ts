import { Tool, ToolServices } from './tool';
import { Point } from './point';

export class Hand extends Tool {

    constructor(name: string, iconPath: string, tooltip: string, toolServices: ToolServices) {
        super(name, iconPath, tooltip, toolServices);
    }

    lastPoint: Point;
    isMouseDown = false;


    onCursorDown(point: Point): void {
        this.lastPoint = point;
        this.isMouseDown = true;
    }

    onCursorMove(point: Point): void {
        if (this.isMouseDown) {
            const deltaX = (point.x - this.lastPoint.x);
            const deltaY = (point.y - this.lastPoint.y);
            this.editorService.translate(-deltaX, -deltaY);
            this.lastPoint = point;
        }
    }

    onCursorUp(): void {
        this.isMouseDown = false;
    }

    onCursorOut(point: Point): void {
        this.onCursorUp();
    }

}
