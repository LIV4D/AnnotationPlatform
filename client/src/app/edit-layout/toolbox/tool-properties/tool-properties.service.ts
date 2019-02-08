import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ToolPropertiesService {

    brushWidth: number;
    eraseAll: boolean;
    smartMask: boolean;
    brushWidthChanged = new BehaviorSubject<number>(10);

    constructor() {
        this.brushWidth = 10;
        this.smartMask = false;
    }

    setBrushWidth(width: number): void {
        if (width === this.brushWidth) {
            return;
        }
        this.brushWidth = width;
        this.brushWidthChanged.next(width);
    }

    incrementBrushWidth(delta: number): void {
        let tempBrushWidth = Math.ceil(this.brushWidth + delta);
        tempBrushWidth = Math.max(1, Math.min(tempBrushWidth, 100));
        this.setBrushWidth(tempBrushWidth);
    }

    SetEraseAll(eraseAll: boolean): void {
        this.eraseAll = eraseAll;
    }

    SetSmartMask(smartMask: boolean): void {
        this.smartMask = smartMask;
    }
}
