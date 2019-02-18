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

        // HACK... 2 offset, wtf?
        let correctionX = 0, correctionY = 0;
        if (biomarkers[0].currentCanvas.width < this.layersService.biomarkerOverlayCanvas.width) {
            correctionX = (biomarkers[0].currentCanvas.width - this.layersService.biomarkerOverlayCanvas.width) / 2;
        }
        if (biomarkers[0].currentCanvas.height < this.layersService.biomarkerOverlayCanvas.height) {
            correctionY = (biomarkers[0].currentCanvas.height - this.layersService.biomarkerOverlayCanvas.height) / 2;
        }
        point.x = point.x + biomarkers[0].offsetX + correctionX;
        point.y = point.y + biomarkers[0].offsetY + correctionY;

        for (let i = 0; i < biomarkers.length; i++) {
            const b = biomarkers[i];
            const b_id = b.id.substr(11); // HACK TO REMOVE annotation_ prefix
            const data = b.currentCanvas.getContext('2d').getImageData(point.x, point.y, 1, 1);
            if (data.data[3] > 120) {
                const biomarkerElem = this.biomarkersService.flat.filter((e) => e.id === b_id)[0];
                this.biomarkersService.setFocusBiomarker(biomarkerElem);
                return true;
            }
        }
        return false;
    }
}
