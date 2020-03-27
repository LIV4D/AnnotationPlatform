import { Injectable } from '@angular/core';
import { LayersService } from './layers.service';
import { NestedTreeControl } from '@angular/cdk/tree';
import { BiomarkerCanvas } from './Tools/biomarker-canvas.service';
import { Biomarker } from './../../models/biomarker.model';
import { BioNode } from './../../models/bionode.model';

export const ANNOTATION_PREFIX = 'annotation-';

@Injectable({
    providedIn: 'root'
})
export class BiomarkerService {
    // public tree: SVGGElement[];
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
            this.dataSourceJson.push(new Biomarker(type, color));
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
        console.log(tree);
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

    // public flatten(tree: SVGGElement[]): HTMLElement[] {
    //     const flat = new Array<HTMLElement>();
    //     tree.forEach(t => {
    //         for (let i = 0; i < t.children.length; i++) {
    //             this.flattenRecursive(t.children[i] as HTMLElement, flat);
    //         }
    //     });
    //     return flat;
    // }

    // public flattenRecursive(elem: HTMLElement, list: HTMLElement[]): void {
    //     if (elem.tagName === 'image') {
    //         list.push(elem);
    //     } else {
    //         for (let i = 0; i < elem.children.length; i++) {
    //             this.flattenRecursive(elem.children[i] as HTMLElement, list);
    //         }
    //     }
    // }

    public isBiomarkerEnabled(bio: Biomarker): boolean {
        return this.onlyEnabledBiomarkers.length === 0 || this.onlyEnabledBiomarkers.indexOf(bio) !== -1;
    }

    // private disable_recursive(elem: HTMLElement): void {
    //     if (this.isBiomarkerEnabled(elem.id)) {
    //         elem.classList.remove('disabledBiomarker');
    //     } else {
    //         elem.classList.add('disabledBiomarker');
    //         if (this.layersService.selectedBiomarkerId === elem.id) {
    //             for (let i = 0; i < this.flat.length; i++) {
    //                 if (this.onlyEnabledBiomarkers.indexOf(this.flat[i].id) !== -1) {
    //                     this.setFocusBiomarker(this.flat[i]);
    //                     break;
    //                 }
    //             }
    //         }
    //     }
    //     if (elem.children.length > 0) {
    //         Array.from(elem.children).forEach((child: HTMLElement) => {
    //             this.disable_recursive(child);
    //         });
    //     }
    // }

    public setFocusBiomarker(node: Biomarker): void {
        const biomarker: Biomarker = this.getBiomarkerOfType(node.type);

        if (this.currentElement !== null && this.currentElement !== undefined && this.currentElement.type === biomarker.type) {
            return;
        }
        if (this.isBiomarkerEnabled(biomarker)) {
            if (this.currentElement !== null && this.currentElement !== undefined) {
                for (let i = 0; i < this.lastBiomarkers.length; i++) {
                    if (this.lastBiomarkers[i].type === this.currentElement.type) {
                        this.lastBiomarkers.splice(i, 1);
                        this.lastBiomarkers.splice(0, 0, this.currentElement);
                        break;
                    }
                }
            }
            this.currentElement = biomarker;
            this.layersService.selectedBiomarkerId = biomarker.type;
            this.toggleVisibility(biomarker, 'visible');
        }
    }

    // public expandToBiomarker(biomarkerId: string): void {
    //     this.nestedTreeControl.dataNodes.forEach((n) => {
    //         this.nestedTreeControl.getDescendants(n).forEach((d) => {
    //             if (this.isBiomarkerEnabled(d.id)) {
    //                 let p = d.parentElement;
    //                 while (p !== null && p.tagName === 'g') {
    //                     this.nestedTreeControl.expand(p);
    //                     p = p.parentElement;
    //                 }
    //             }
    //         });
    //     });
    // }

    // public getAllElements(elem: HTMLElement): Array<string> {
    //     elem.removeAttribute('xlink:href');
    //     let allElement = new Array<string>();
    //     if (elem.children.length > 0) {
    //         Array.from(elem.children).forEach((child: HTMLElement) => {
    //             allElement = allElement.concat(this.getAllElements(child));
    //         });
    //     } else {
    //         return new Array<string>(elem.id);
    //     }
    //     return allElement;
    // }

    // public deleteElements(elem: HTMLElement): void {
    //     this.layersService.resetBiomarkerCanvas(this.getAllElements(elem));
    // }

    // public getCssClass(elem: HTMLElement): string {
    //     let classes = '';
    //     if (this.currentElement !== undefined && this.currentElement === elem) {
    //         classes += 'selected ';
    //     }

    //     if (!this.isBiomarkerEnabled(elem.id)) {
    //         classes += 'disabledBiomarker ';
    //     }

    //     return classes;
    // }

    public getVisibility(node: Biomarker): string {
        return this.getBiomarkerOfType(node.type).isVisible ? this.VISIBILITY : this.VISIBILITY_OFF;
    }

    public getBiomarkerOfType(type: string): Biomarker {
        for (const item of this.dataSourceJson) {
            if (type === item.type) {
                return item;
            }
        }
        return null
    }

    public toggleVisibility(node: Biomarker, visibility?: string): void {
        // const elem: HTMLElement = document.getElementById(id);
        // if (visibility === undefined) {
        //     visibility = elem.style.visibility === 'hidden' ? 'visible' : 'hidden';
        // } else if (visibility === elem.style.visibility) {
        //     return;
        // }
        // this.toggleVisibilityRecursive(elem, visibility);
        // this.setParentVisibility(elem);
        // this.applyVisibility();

        if (visibility === undefined){
            this.getBiomarkerOfType(node.type).isVisible = !this.getBiomarkerOfType(node.type).isVisible;
        } else if (visibility === this.VISIBILITY) {
            this.getBiomarkerOfType(node.type).isVisible = true;
        } else if (visibility === this.VISIBILITY_OFF) {
            this.getBiomarkerOfType(node.type).isVisible = false;
        }

        // console.log(node.type)

        // const index = this.dataSourceJson.indexOf(node);

        // if (index != -1) {
        //     this.dataSourceJson[index].isVisible = !this.dataSourceJson[index].isVisible;
        // }
    }

    public toggleSoloVisibility(node: Biomarker): void {
        // this.toggleAllBiomarkers('hidden');
        // this.toggleVisibility(node);
    }

    public toggleAllBiomarkers(visibility: string): void {
        // if (this.onlyEnabledBiomarkers === null) {
        //     this.tree.forEach((e) => {
        //         const elem = document.getElementById(e.id);
        //         this.toggleVisibilityRecursive(elem, visibility);
        //     });
        // } else {
        //     this.tree.forEach((e) => {
        //         const elem = document.getElementById(e.id);
        //         this.toggleVisibilityRecursive(elem, 'hidden');
        //     });
        //     if (visibility === 'visible') {
        //         this.flat.forEach((e) => {
        //             if (this.isBiomarkerEnabled(e)) {
        //                 const elem = document.getElementById(e.id);
        //                 this.toggleVisibility(e.id, 'visible');
        //             }
        //         });
        //     }
        // }

        this.applyVisibility();
    }

    // public hideOtherBiomarkers(): void {
    //     if (this.currentElement !== undefined) {
    //         const elemSelected = document.getElementById(this.currentElement.id);
    //         const visibility = elemSelected.style.visibility;
    //         let everythingHidden = true;
    //         for (let i = 0; i < this.flat.length; i++) {
    //             const b = this.flat[i];
    //             if (b.id === this.currentElement.id) {
    //                 continue;
    //             }
    //             const elem = document.getElementById(b.id);
    //             if (elem.style.visibility === 'visible') {
    //                 everythingHidden = false;
    //                 break;
    //             }
    //         }

    //         this.toggleAllBiomarkers('hidden');

    //         if ((!everythingHidden) || visibility === 'hidden') {
    //             elemSelected.style.visibility = 'visible';
    //             this.toggleVisibilityRecursive(elemSelected, 'visible');
    //         }

    //         this.applyVisibility();
    //     }
    // }

    private applyVisibility(): void {
        // HACK...
        // this.layersService.biomarkerCanvas.forEach((b: BiomarkerCanvas) => {
        //     const svgElem = document.getElementById(b.id.replace(ANNOTATION_PREFIX, ''));
        //     b.displayCanvas.style.visibility = svgElem.style.visibility;
        // });
    }

    private setParentVisibility(elem: HTMLElement): void {
        if ((elem.parentElement.style.visibility === 'visible' || elem.style.visibility === '') && elem.parentElement.tagName === 'g') {
            this.allChildrenHidden = true;
            this.parentToResetVisibility = elem.parentElement;
            this.checkAllChildrenHidden(elem.parentElement);
            if (this.allChildrenHidden) {
                elem.parentElement.style.visibility = 'hidden';
                this.setParentVisibility(elem.parentElement);
            }
        }
    }

    // We check if any of the child is still visible
    private checkAllChildrenHidden(elem: HTMLElement): void {
        if ((elem.style.visibility === 'visible' || elem.style.visibility === '') && !elem.isEqualNode(this.parentToResetVisibility)) {
            this.allChildrenHidden = false;
        }
        if (elem.children.length > 0) {
            Array.from(elem.children).forEach((child: HTMLElement) => {
                this.checkAllChildrenHidden(child);
            });
        }
    }

    // We toggle the opacity of all the children. When making setting the opacity to 1,
    // we must set all the parents opacities to 1.
    private toggleVisibilityRecursive(elem: HTMLElement, visibility: string): void {
        elem.style.visibility = visibility;
        if (elem.children.length > 0) {
            Array.from(elem.children).forEach((child: HTMLElement) => {
                this.toggleVisibilityRecursive(child, visibility);
            });
        }
        if (visibility === 'visible') {
            this.resetParentVisibilityRecursive(elem);
        }

    }

    // We reset the parent opacity to 1 when a child becomes visible.
    // If the parent is opacity 0, the child will never be displayed
    private resetParentVisibilityRecursive(elem: HTMLElement): void {
        if (elem.parentElement.tagName === 'g') {
            this.resetParentVisibilityRecursive(elem.parentElement);
        }
        elem.parentElement.style.visibility = 'visible';
    }

    public changeOpacity(opacity: string): void {
        this.layersService.biomarkerCanvas.forEach(b => {
            b.displayCanvas.style.opacity = (Number(opacity) / 100).toString();
            b.displayCanvas.style['mix-blend-mode'] = Number(opacity) <= 75 ? 'color' : 'normal';
        });
    }

    // get serviceHasNestedChild() {
    //     return this.hasNestedChild;
    // }
}
