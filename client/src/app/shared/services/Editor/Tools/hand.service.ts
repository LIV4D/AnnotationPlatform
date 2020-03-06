import { Tool } from './tool.service';
import { Point } from './point.service';

export class Hand extends Tool {
    constructor(name: string, iconPath: string, tooltip: string, editorService, layersService) {
        super(name, iconPath, tooltip, editorService, layersService);
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
