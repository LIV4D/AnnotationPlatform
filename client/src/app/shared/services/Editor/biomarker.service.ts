import { Injectable } from '@angular/core';
import { LayersService } from './layers.service';
import { NestedTreeControl } from '@angular/cdk/tree';
import { Biomarker } from './../../models/biomarker.model';
import { BioNode } from './../../models/bionode.model';

export const ANNOTATION_PREFIX = 'annotation-';

@Injectable({
    providedIn: 'root'
})
export class BiomarkerService {
    public flat: HTMLElement[];
    public flatEnabledBiomarkers: HTMLElement[];
    public lastBiomarkers: Biomarker[];
    public onlyEnabledBiomarkers = new Array<Biomarker>();
    public dataSource;
    public nestedTreeControl: NestedTreeControl<HTMLElement>;
    public allChildrenHidden: boolean;
    public parentToResetVisibility: HTMLElement;
    public currentElement: Biomarker;

    public dataSourceJson = [];
    public tree: BioNode[];

    readonly VISIBILITY = 'visibility';
    readonly VISIBILITY_OFF = 'visibility_off';

    constructor(private layersService: LayersService) {
    }

    public initJsonRecursive(data: object){
        const biomarkersString = 'biomarkers';
        const typeString = 'type';
        const colorString = 'color';

        const topLevelBiomarkers = data[biomarkersString];
        for (let [key, value] of Object.entries(topLevelBiomarkers)) {
            const type = value[typeString];
            let color = null;
            if (value[colorString]) {
                color = value[colorString];
            }
            if (value[biomarkersString]) {
                this.initJsonRecursive(value as object);
            }
            if (this.getBiomarkerOfType(type) == null) {
                this.dataSourceJson.push(new Biomarker(type, color));
            }
        }

        this.onlyEnabledBiomarkers = Array.from(this.dataSourceJson);

        this.lastBiomarkers = [];
    }

    public buildTreeRecursive(data: object): BioNode[]{
        const biomarkersString = 'biomarkers';
        const typeString = 'type';
        const colorString = 'color';

        let tree: BioNode[] = [];

        const topLevelBiomarkers = data[biomarkersString];
        for (let [key, value] of Object.entries(topLevelBiomarkers)) {
            const type = value[typeString];
            let color = null;
            if (value[colorString]) {
                color = value[colorString];
            }

            let node: BioNode = { type: type, color: color, biomarkers: null};

            if (value[biomarkersString]) {
                const childrenNodes = this.buildTreeRecursive(value as object);
                node[biomarkersString] = childrenNodes;
            }

            tree.push(node)

        }
        this.tree = tree;

        return this.tree
    }

    get dataSourceSimpleView() {
        const data = [];
        for (const node of this.dataSourceJson) {
            if (node.color != null){
                data.push(node);
            }
        }
        return data;
    }

    public isBiomarkerEnabled(bio: Biomarker): boolean {
        return this.onlyEnabledBiomarkers.length === 0 || this.onlyEnabledBiomarkers.indexOf(bio) !== -1;
    }

    public deleteElements(type: string): void {
        const biomarker = this.getBiomarkerOfType(type);

        let toDelete = null;

        if (biomarker.color != null) {
            toDelete = [type];
        } else {
            toDelete = this.getChildrenList(this.getBiomarkerOfType(type));
        }

        this.layersService.resetBiomarkerCanvas(toDelete);
    }

    getChildrenList(node: Biomarker){
        let childrenList = [];
        const tree = this.findBiomarkerInTree(node, this.tree);
        for (const item of tree){
            if (item['biomarkers'] != null){
                childrenList = childrenList.concat(this.getChildrenList(item))
            } else {
                childrenList.push(item.type);
            }
        }
        return childrenList;
    }

    public getBiomarkerOfType(type: string): Biomarker {
        for (const item of this.dataSourceJson) {
            if (type === item.type) {
                return item;
            }
        }
        return null
    }

    public findBiomarkerInTree(node: Biomarker, tree){
        let newTree = null;
        for (const biomarker of tree){
            if (biomarker.type == node.type){
                newTree = biomarker['biomarkers'];
                return newTree
            }
        }
        for (const biomarker of tree){
            if (biomarker['biomarkers'] != null){
                let ret = this.findBiomarkerInTree(node, biomarker['biomarkers'])
                if (ret != null){
                    return ret
                }
            }
        }
        
        return newTree;
    }

    public changeOpacity(opacity: string): void {
        this.layersService.biomarkerCanvas.forEach(b => {
            b.displayCanvas.style.opacity = (Number(opacity) / 100).toString();
            b.displayCanvas.style['mix-blend-mode'] = Number(opacity) <= 75 ? 'color' : 'normal';
        });
    }

    shortenedTypeOf(node: BioNode){
        const MAX_LENGTH = 10;
        if (node.type.length <= MAX_LENGTH) {
            return node.type
        }
        return node.type.slice(0,MAX_LENGTH) + '...'
    }

    public getCssClass(node: Biomarker): string {
        let classes = '';
        if (this.currentElement !== undefined && this.currentElement.type === node.type) {
            classes += 'selected ';
        }

        if (!this.isBiomarkerEnabled(node)) {
            classes += 'disabledBiomarker ';
        }

        return classes;
    }
}
