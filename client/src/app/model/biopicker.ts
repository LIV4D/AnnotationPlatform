import { Tool } from './tool';
import { Point } from './point';

export class BioPicker extends Tool {

    constructor(name: string, iconPath: string, tooltip: string) {
        super(name, iconPath, tooltip);
    }

    onCursorDown(point: Point): void {
        this.selectUnder(point);
    }

    selectUnder(point: Point): boolean {
        const biomarkers = this.layersService.getBiomarkerCanvas();
        for (let i = 0; i < biomarkers.length; i++) {
            const b = biomarkers[i];
            const b_id = b.id.substr(11); // HACK TO REMOVE annotation_ prefix
            const data = b.currentCanvas.getContext('2d').getImageData(b.offsetX + point.x, b.offsetY + point.y, 1, 1);
            if (data.data[3] > 120) {
                const biomarkerElem = this.biomarkersService.flat.filter((e) => e.id === b_id)[0];
                this.biomarkersService.setFocusBiomarker(biomarkerElem);
                return true;
            }
        }
        return false;
    }
}
