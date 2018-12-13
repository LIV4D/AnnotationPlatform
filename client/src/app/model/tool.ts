import { LayersService } from './../edit-layout/editor/layers/layers.service';
import { Point } from './point';
import { BiomarkerCanvas } from './biomarker-canvas';

export class Tool {
    disabled: boolean;
    
    constructor(private _name, private _iconPath: string, private _tooltip: string, protected layersService: LayersService) {
        this.disabled = false;
    }

    get iconPath(): string {
        return this._iconPath;
    }

    get tooltip(): string {
        return this._tooltip;
    }

    get name(): string {
        return this._name;
    }

    onMouseDown(point: Point): void {}
    onMouseUp(): void {}
    onMouseMove(point: Point): void {}
    onMouseOut(point: Point): void {}

    applyDrawCanvas(destCanvas:HTMLCanvasElement){
        const ctx = destCanvas.getContext('2d');
        ctx.save();
        ctx.globalCompositeOperation = 'copy';
        ctx.drawImage(this.layersService.tempMaskCanvas,0,0);
        ctx.globalCompositeOperation = 'source-in';
        ctx.drawImage(this.layersService.tempDrawCanvas,0,0);
        ctx.restore();
    }
}
