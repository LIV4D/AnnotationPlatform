import { LayersService } from '../layers.service';
import { Point } from './point.service';
import { CanvasDimensionService } from '../canvas-dimension.service';

export class Tool {
  disabled: boolean;

  protected layersService: LayersService;
  protected canvasDimensionService: CanvasDimensionService;

  public name: string;
  public imagePath: string;
  public tooltip: string;

  protected changeBoundedBox: DOMRect;

  constructor(name: string, imagePath: string, tooltip: string, canvasDimensionService: CanvasDimensionService, layersService: LayersService) {
    this.name = name;
    this.imagePath = imagePath;
    this.tooltip = tooltip;
    this.layersService = layersService;
    this.canvasDimensionService = canvasDimensionService;
  }

  onCursorDown(point: Point): void { }
  onCursorUp(): void { }
  onCursorMove(point: Point): void { }
  onCursorOut(point: Point): void { }
  onCancel(): void { }

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

  updateChangeBoundedBox(p: Point, r = 0): void {
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
