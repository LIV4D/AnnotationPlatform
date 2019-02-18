import { LayersService } from './../edit-layout/editor/layers/layers.service';
import { Point } from './point';
import { BiomarkerCanvas } from './biomarker-canvas';
import { timingSafeEqual } from 'crypto';
import { RootInjector } from '../root-injector';
import { EditorService } from '../edit-layout/editor/editor.service';
import { ToolPropertiesService } from '../edit-layout/toolbox/tool-properties/tool-properties.service';
import { BiomarkersService } from '../edit-layout/right-menu/biomarkers/biomarkers.service';
import { ThrowStmt } from '@angular/compiler';

export class Tool {
    disabled: boolean;

    protected layersService: LayersService;
    protected editorService: EditorService;
    protected toolPropertiesService: ToolPropertiesService;
    protected biomarkersService: BiomarkersService;
    protected changeBoundedBox: DOMRect;

    constructor(private _name, private _iconPath: string, private _tooltip: string) {
        this.disabled = false;
        this.layersService = RootInjector.injector.get(LayersService);
        this.editorService = RootInjector.injector.get(EditorService);
        this.toolPropertiesService = RootInjector.injector.get(ToolPropertiesService);
        this.toolPropertiesService.setBrushWidth(10);
        this.biomarkersService = RootInjector.injector.get(BiomarkersService);
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

    onCursorDown(point: Point): void {}
    onCursorUp(): void {}
    onCursorMove(point: Point): void {}
    onCursorOut(point: Point): void {}
    onCancel(): void {}

    get drawCanvas(): HTMLCanvasElement {
        return this.layersService.tempDrawCanvas;
    }

    get drawContext(): CanvasRenderingContext2D {
        return this.layersService.tempDrawCanvas.getContext('2d');
    }

    get maskCanvas(): HTMLCanvasElement {
        return this.layersService.tempMaskCanvas;
    }

    get maskContext(): CanvasRenderingContext2D {
        return this.layersService.tempMaskCanvas.getContext('2d');
    }

    updateChangeBoundedBox(p: Point, r= 0): void {
        r += 1;
        if (this.changeBoundedBox) {
            const maxX = this.changeBoundedBox.width + this.changeBoundedBox.x;
            this.changeBoundedBox.x = Math.min(this.changeBoundedBox.x, p.x - r);
            this.changeBoundedBox.width = Math.max(maxX, p.x + r) - this.changeBoundedBox.x;

            const maxY = this.changeBoundedBox.height + this.changeBoundedBox.y;
            this.changeBoundedBox.y = Math.min(this.changeBoundedBox.y, p.y - r);
            this.changeBoundedBox.height = Math.max(maxY, p.y + r) - this.changeBoundedBox.y;
        } else {
            this.changeBoundedBox = new DOMRect(p.x - r, p.y - r, 2 * r, 2 * r);
        }
    }

    resetChangeBoundedBox(): void {
        this.changeBoundedBox = null;
    }

    applyDrawCanvas(destCanvas: HTMLCanvasElement): void {
        const ctx = destCanvas.getContext('2d');
        ctx.save();
        ctx.globalCompositeOperation = 'copy';
        ctx.drawImage(this.layersService.tempMaskCanvas, 0, 0);
        ctx.globalCompositeOperation = 'source-in';
        ctx.drawImage(this.layersService.tempDrawCanvas, 0, 0);
        ctx.restore();
    }
}
