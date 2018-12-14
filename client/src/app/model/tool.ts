import { LayersService } from './../edit-layout/editor/layers/layers.service';
import { Point } from './point';
import { BiomarkerCanvas } from './biomarker-canvas';
import { timingSafeEqual } from 'crypto';
import { RootInjector } from '../root-injector';
import { EditorService } from '../edit-layout/editor/editor.service';
import { ToolPropertiesService } from '../edit-layout/toolbox/tool-properties/tool-properties.service';

export class Tool {
    disabled: boolean;

    protected layersService: LayersService;
    protected editorService: EditorService;
    protected toolPropertiesService: ToolPropertiesService;

    constructor(private _name, private _iconPath: string, private _tooltip: string) {
        this.disabled = false;
        this.layersService = RootInjector.injector.get(LayersService);
        this.editorService = RootInjector.injector.get(EditorService);
        this.toolPropertiesService = RootInjector.injector.get(ToolPropertiesService);
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
