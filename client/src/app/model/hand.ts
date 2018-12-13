import { LayersService } from './../edit-layout/editor/layers/layers.service';
import { EditorService } from './../edit-layout/editor/editor.service';
import { Tool } from './tool';
import { Point } from './point';

export class Hand extends Tool {

    constructor(name: string, iconPath: string, tooltip: string,
        layersService: LayersService, private editorService: EditorService) {
        super(name, iconPath, tooltip, layersService);
    }

    lastPoint: Point;
    isMouseDown = false;


    onMouseDown(point: Point): void {
        this.lastPoint = point;
        this.isMouseDown = true;
    }

    onMouseOut(point: Point): void {
        this.onMouseUp();
    }

    onMouseUp(): void {
        this.isMouseDown = false;
    }

    onMouseMove(point: Point): void {
        if (this.isMouseDown) {
            const deltaX = (point.x - this.lastPoint.x);
            const deltaY = (point.y - this.lastPoint.y);
            this.editorService.translate(-deltaX, -deltaY);
            this.lastPoint = point;
        }
    }

}
