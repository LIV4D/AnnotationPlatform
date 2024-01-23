import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ToolPropertiesService {

    brushWidth: number;
    baseBrushWidth: number;
    enableBrushMultiplier: boolean;
    eraseAll: boolean;
    smartMask: boolean;
    brushWidthChanged = new BehaviorSubject<number>(5);

    constructor() {
        this.brushWidth = 10;
        this.baseBrushWidth = 5;
        this.smartMask = false;
        this.eraseAll = true;
        this.enableBrushMultiplier = true;
    }

    setBrushWidth(width: number, setBaseBrush= true): void {
        width = Math.max(1, width);
        if (width === this.brushWidth) {
            return;
        }
        this.brushWidth = width;
        if (setBaseBrush) {
            this.baseBrushWidth = width;
        }
        this.brushWidthChanged.next(width);
    }

    incrementBrushWidth(delta: number, setBaseBrush= true): void {
        const tempBrushWidth = Math.ceil(this.brushWidth + delta);
        this.setBrushWidth(tempBrushWidth, setBaseBrush);
    }

    setBrushWidthMultiplier(multiplier: number): void {
        if (!this.enableBrushMultiplier) {
            return;
        }
        multiplier = (Math.max(multiplier, 0.15) - 0.15) / 0.85;
        if (multiplier > .7) {
            multiplier += (multiplier - .7) * 2;
        }
        const delta = Math.ceil(multiplier * this.baseBrushWidth * 5);
        this.setBrushWidth(this.baseBrushWidth + delta, false);
    }

    setEnableBrushMultiplier(e: boolean): void {
        this.enableBrushMultiplier = e;
        if (!e) {
            this.setBrushWidth(this.baseBrushWidth);
        }
    }

    SetEraseAll(eraseAll: boolean): void {
        this.eraseAll = eraseAll;
    }

    SetSmartMask(smartMask: boolean): void {
        this.smartMask = smartMask;
    }
}
