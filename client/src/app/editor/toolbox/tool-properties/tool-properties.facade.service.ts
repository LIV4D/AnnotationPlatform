import { Injectable } from '@angular/core';
import { ToolPropertiesService } from 'src/app/shared/services/Editor/tool-properties.service';

@Injectable({
    providedIn: 'root'
})
export class ToolPropertiesFacadeService {

    constructor(private toolPropertiesService: ToolPropertiesService) {
    }

    setBrushWidth(width: number, setBaseBrush= true): void {
        this.toolPropertiesService.setBrushWidth(width, setBaseBrush);
    }

    incrementBrushWidth(delta: number, setBaseBrush= true): void {
        this.toolPropertiesService.incrementBrushWidth(delta, setBaseBrush);
    }

    setBrushWidthMultiplier(multiplier: number): void {
        this.toolPropertiesService.setBrushWidthMultiplier(multiplier);
    }

    setEnableBrushMultiplier(e: boolean): void {
        this.toolPropertiesService.setEnableBrushMultiplier(e);
    }

    SetEraseAll(eraseAll: boolean): void {
        this.toolPropertiesService.SetEraseAll(eraseAll);
    }

    SetSmartMask(smartMask: boolean): void {
        this.toolPropertiesService.SetSmartMask(smartMask);
    }

    get brushWidthChanged() {
        return this.toolPropertiesService.brushWidthChanged;
    }

    get enableBrushMultiplier() {
        return this.toolPropertiesService.enableBrushMultiplier;
    }
}
