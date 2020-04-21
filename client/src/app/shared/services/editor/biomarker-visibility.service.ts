import { Injectable } from '@angular/core';
import { Biomarker } from '../../models/biomarker.model';
import { LayersService } from './layers.service';
import { BiomarkerService } from './biomarker.service';

export const ANNOTATION_PREFIX = 'annotation-';

@Injectable({
    providedIn: 'root'
})
export class BiomarkerVisibilityService {
    readonly VISIBILITY = 'visibility';
    readonly VISIBILITY_OFF = 'visibility_off';

    constructor(private layersService: LayersService, private biomarkerService: BiomarkerService){

    }

    public getVisibility(node: Biomarker): string {
        return this.biomarkerService.getBiomarkerOfType(node.type).isVisible ? this.VISIBILITY : this.VISIBILITY_OFF;
    }

    public toggleVisibility(node: Biomarker, visibility?: string): void {
        if (visibility === undefined){
            this.biomarkerService.getBiomarkerOfType(node.type).isVisible = !this.biomarkerService.getBiomarkerOfType(node.type).isVisible;
        } else if (visibility === 'visible') {
            this.biomarkerService.getBiomarkerOfType(node.type).isVisible = true;
        } else if (visibility === 'hidden') {
            this.biomarkerService.getBiomarkerOfType(node.type).isVisible = false;
        }

        this.applyVisibility(this.biomarkerService.getBiomarkerOfType(node.type));
    }

    public toggleVisibilityParent(node: Biomarker, tree){
        const visibility = !this.biomarkerService.getBiomarkerOfType(node.type).isVisible ? 'visible' : 'hidden';
        this.toggleVisibilityRecursive(node, tree, visibility);
    }

    public toggleVisibilityRecursive(node: Biomarker, tree, visibility?: string): void {
        this.toggleVisibility(node, visibility);
        for (const biomarker of this.biomarkerService.findBiomarkerInTree(node, tree)){
            if (biomarker['biomarkers'] != null){
                this.toggleVisibilityRecursive(biomarker, tree, visibility);
            } else {
                this.toggleVisibility(biomarker, visibility);
            }
        }
    }

    public toggleSoloVisibility(node: Biomarker): void {
        this.toggleAllBiomarkers('hidden');
        this.toggleVisibility(this.biomarkerService.getBiomarkerOfType(node.type));
    }

    public toggleAllBiomarkers(visibility: string): void {
        for (const item of this.layersService.biomarkerCanvas) {
            this.toggleVisibility(this.biomarkerService.getBiomarkerOfType(item.id.replace('annotation-', '')), visibility)
        }
    }

    private applyVisibility(node: Biomarker): void {
        for (const item of this.layersService.biomarkerCanvas) {
            if (item.id === 'annotation-'+node.type){
                item.setVisibility(this.biomarkerService.getBiomarkerOfType(node.type).isVisible);
            }
        }
    }

    public setFocusBiomarker(node: Biomarker): void {
        const biomarker: Biomarker = this.biomarkerService.getBiomarkerOfType(node.type);

        if (this.biomarkerService.currentElement !== null && this.biomarkerService.currentElement !== undefined && this.biomarkerService.currentElement.type === biomarker.type) {
            return;
        }
        if (this.biomarkerService.isBiomarkerEnabled(biomarker)) {
            if (this.biomarkerService.currentElement !== null && this.biomarkerService.currentElement !== undefined) {
                for (let i = 0; i < this.biomarkerService.lastBiomarkers.length; i++) {
                    if (this.biomarkerService.lastBiomarkers[i].type === this.biomarkerService.currentElement.type) {
                        this.biomarkerService.lastBiomarkers.splice(i, 1);
                        this.biomarkerService.lastBiomarkers.splice(0, 0, this.biomarkerService.currentElement);
                        break;
                    }
                }
            }
            this.biomarkerService.currentElement = biomarker;
            this.layersService.selectedBiomarkerId = biomarker.type;
            this.toggleVisibility(biomarker, 'visible');
        }
    }

}
