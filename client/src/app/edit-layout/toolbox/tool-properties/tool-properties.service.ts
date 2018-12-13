import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class ToolPropertiesService {

    brushWidth: number;
    eraseAll: boolean;
    smartMask: boolean;

    constructor() {
        this.brushWidth = 1;
        this.smartMask = false;
    }

    SetBrushWidth(width: number): void {
        this.brushWidth = width;
    }

    AddBrushWidth(delta: number): void {
        let tempBrushWidth = Math.ceil(this.brushWidth + delta);
        tempBrushWidth = Math.max(1, Math.min(tempBrushWidth, 100));
        console.log(tempBrushWidth);
        this.SetBrushWidth(tempBrushWidth);
    }

    SetEraseAll(eraseAll: boolean): void {
        this.eraseAll = eraseAll;
    }

    SetSmartMask(smartMask: boolean): void{
        this.smartMask = smartMask;
    }
}
