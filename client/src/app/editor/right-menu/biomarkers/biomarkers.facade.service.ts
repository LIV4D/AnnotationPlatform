import { Injectable } from '@angular/core';
import { LayersService } from './../../../shared/services/Editor/layers.service';
import { ImageBorderService } from 'src/app/shared/services/Editor/image-border.service';
import { BiomarkerService } from 'src/app/shared/services/Editor/biomarker.service';

@Injectable({
    providedIn: 'root'
})
export class BiomarkersFacadeService {
    constructor(private layersService: LayersService,
                private imageBorderService: ImageBorderService,
                private biomarkerService: BiomarkerService) {

    }

    // ImageBorderService
    set showBorders(showBorders: boolean) {
        this.imageBorderService.showBorders = showBorders;
    }

    // LayersService
    toggleBorders(showBorders) {
        this.layersService.toggleBorders(showBorders);
    }

    toggleShadows(showShadows) {
        this.layersService.toggleShadows(showShadows);
    }

    // BiomarkerService
    init(arbre: SVGGElement[]) {
        this.biomarkerService.init(arbre);
    }

    changeOpacity(opacity: string) {
        this.biomarkerService.changeOpacity(opacity);

    }

    getCssClass(elem: HTMLElement) {
        return this.biomarkerService.getCssClass(elem);
    }

    setFocusBiomarker(elem: HTMLElement) {
        this.biomarkerService.setFocusBiomarker(elem);
    }

    deleteElements(elem) {
        this.biomarkerService.deleteElements(elem);
    }

    toggleVisibility(id, visibility?: string) {
        this.biomarkerService.toggleVisibility(id, visibility);
    }

    toggleSoloVisibility(id) {
        this.biomarkerService.toggleSoloVisibility(id);
    }

    hideOtherBiomarkers() {
        this.biomarkerService.hideOtherBiomarkers();
    }

    toggleAllBiomarkers(visibility) {
        this.biomarkerService.toggleAllBiomarkers(visibility);
    }

}
