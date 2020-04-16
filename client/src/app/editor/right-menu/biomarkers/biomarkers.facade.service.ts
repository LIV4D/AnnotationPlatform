import { Injectable } from '@angular/core';
import { LayersService } from './../../../shared/services/Editor/layers.service';
import { ImageBorderService } from 'src/app/shared/services/Editor/image-border.service';
import { BiomarkerService } from 'src/app/shared/services/Editor/biomarker.service';
import { BiomarkerVisibilityService } from 'src/app/shared/services/Editor/biomarker-visibility.service';
import { Biomarker } from 'src/app/shared/models/biomarker.model';
import { BioNode } from 'src/app/shared/models/bionode.model';

@Injectable({
    providedIn: 'root'
})
export class BiomarkersFacadeService {
    constructor(private layersService: LayersService,
                private imageBorderService: ImageBorderService,
                private biomarkerService: BiomarkerService,
                private biomarkerVisibilityService: BiomarkerVisibilityService) {

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

    changeOpacity(opacity: string) {
        this.biomarkerService.changeOpacity(opacity);

    }

    getCssClass(node: Biomarker) {
        return this.biomarkerService.getCssClass(node);
    }

    setFocusBiomarker(node: Biomarker) {
        this.biomarkerVisibilityService.setFocusBiomarker(node);
    }

    deleteElements(type: string) {
        this.biomarkerService.deleteElements(type);
    }

    toggleVisibility(node, visibility?: string) {
        this.biomarkerVisibilityService.toggleVisibility(node, visibility);
    }

    toggleVisibilityParent(node, tree){
        this.biomarkerVisibilityService.toggleVisibilityParent(node, tree);
    }

    toggleSoloVisibility(node) {
        this.biomarkerVisibilityService.toggleSoloVisibility(node);
    }

    toggleAllBiomarkers(visibility) {
        this.biomarkerVisibilityService.toggleAllBiomarkers(visibility);
    }

    get dataSource() {
        return this.biomarkerService.dataSource;
    }

    get dataSourceJson() {
        return this.biomarkerService.dataSourceJson;
    }

    get nestedTreeControl() {
        return this.biomarkerService.nestedTreeControl;
    }

    get flatEnabledBiomarkers() {
        return this.biomarkerService.flatEnabledBiomarkers;
    }

    get currentElement(){
        return this.biomarkerService.currentElement;
    }

    get lastBiomarkers(){
        return this.biomarkerService.lastBiomarkers;
    }

    get tree(){
        return this.biomarkerService.tree;
    }

    public getVisibility(node: Biomarker): string {
        return this.biomarkerVisibilityService.getVisibility(node);
    }

    get dataSourceSimpleView(){
        return this.biomarkerService.dataSourceSimpleView;
    }

    shortenedTypeOf(node: BioNode){
        return this.biomarkerService.shortenedTypeOf(node);
    }
}
