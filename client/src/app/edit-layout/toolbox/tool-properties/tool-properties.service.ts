import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ToolPropertiesService {

    brushWidth: number;
    eraseAll: boolean;s
    smartMask: boolean;
    brushWidthChanged = new BehaviorSubject<number>(10);

    constructor() {
        this.brushWidth = 10;
        this.smartMask = false;
        this.eraseAll = true;
    }

    setBrushWidth(width: number): void {
        width = Math.max(1, width);
        if (width === this.brushWidth) {
            return;
        }
        this.brushWidth = Math.max(1, width);
        this.brushWidthChanged.next(Math.max(1, width));
    }

    incrementBrushWidth(delta: number): void {
        let tempBrushWidth = Math.ceil(this.brushWidth + delta);
        tempBrushWidth = Math.max(1, tempBrushWidth);
        this.setBrushWidth(tempBrushWidth);
    }

    SetEraseAll(eraseAll: boolean): void {
        this.eraseAll = eraseAll;
    }

    SetSmartMask(smartMask: boolean): void {
        this.smartMask = smartMask;
    }
}
