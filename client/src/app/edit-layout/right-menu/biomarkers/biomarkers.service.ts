import { LayersService, ANNOTATION_PREFIX } from './../../editor/layers/layers.service';
import { Injectable } from '@angular/core';
import { NestedTreeControl } from '@angular/cdk/tree';
import { BiomarkerCanvas } from './../../../model/biomarker-canvas';


const NOT_SELECTED = 'not-selected';

@Injectable()
export class BiomarkersService {
    public tree: SVGGElement[];
    public flat: HTMLElement[];
    public dataSource;
    public nestedTreeControl: NestedTreeControl<SVGGElement>;
    public allChildrenHidden: boolean;
    public parentToResetVisibility: HTMLElement;
    public currentElement: HTMLElement;
    constructor(private layersService: LayersService) {
    }

    private _getChildren = (node: SVGGElement) => Array.from(node.children) as SVGGElement[];
    private hasNestedChild = (_: number, nodeData: SVGGElement) => (nodeData.children.length !== 0);

    public init(arbre: SVGGElement[]): void {
        this.tree = arbre;
        this.flat = [];
        this.nestedTreeControl = new NestedTreeControl<SVGGElement>(this._getChildren);
        this.dataSource = this.tree;
        this.flat = this.flatten(this.tree);
    }

    public flatten(tree: SVGGElement[]): HTMLElement[] {
        tree.forEach(t => {
            for (let i = 0; i < t.children.length; i++) {
                this.flattenRecursive(t.children[i] as HTMLElement, this.flat);
            }
        });
        this.setFocusBiomarker(this.flat[0]);
        return this.flat;
    }

    public flattenRecursive(elem: HTMLElement, list: HTMLElement[]): void {
        if (elem.tagName === 'image') {
            list.push(elem);
        }
        for (let i = 0; i < elem.children.length; i++) {
            this.flattenRecursive(elem.children[i] as HTMLElement, list);
        }
    }
    public setFocusBiomarker(elem: HTMLElement): void {
        this.currentElement = elem;
        this.layersService.selectedBiomarkerId = elem.id;
    }

    public getAllElements(elem: HTMLElement): Array<string> {
        elem.removeAttribute('xlink:href');
        let allElement = new Array<string>();
        if (elem.children.length > 0) {
            Array.from(elem.children).forEach((child: HTMLElement) => {
                allElement = allElement.concat(this.getAllElements(child));
            });
        } else {
            return new Array<string>(elem.id);
        }
        return allElement;
    }

    public deleteElements(elem: HTMLElement): void {
        this.layersService.resetBiomarkerCanvas(this.getAllElements(elem));
    }

    public getCssClass(elem: HTMLElement): string {
        if (this.currentElement !== undefined && this.currentElement === elem) {
            return 'selected';
        }
    }

    public toggleVisibility(id: string): void {
        const elem: HTMLElement = document.getElementById(id);
        (elem.style.visibility === 'hidden') ?
            this.toggleVisibilityRecursive(elem, 'visible') :
            this.toggleVisibilityRecursive(elem, 'hidden');
        this.setParentVisibility(elem);
        this.layersService.biomarkerCanvas.forEach((b: BiomarkerCanvas) => {
            const svgElem = document.getElementById(b.id.replace(ANNOTATION_PREFIX, ''));
            b.displayCanvas.style.visibility = svgElem.style.visibility;
        });
    }

    public toggleSoloVisibility(id: string): void{
        this.toggleAllBiomarkers('hidden');
        this.toggleVisibility(id);
    }

    public setParentVisibility(elem: HTMLElement): void {
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
    public checkAllChildrenHidden(elem: HTMLElement): void {
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
    public toggleVisibilityRecursive(elem: HTMLElement, visibility: string): void {
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
    public resetParentVisibilityRecursive(elem: HTMLElement): void {
        if (elem.parentElement.tagName === 'g') {
            this.resetParentVisibilityRecursive(elem.parentElement);
        }
        elem.parentElement.style.visibility = 'visible';
    }

    public changeOpacity(opacity: string): void {
        this.layersService.biomarkerCanvas.forEach(b => {
            b.displayCanvas.style.opacity = (Number(opacity) / 100).toString();
        });
    }

    public hideOtherBiomarkers(): void {
        if (this.currentElement !== undefined) {
            this.tree.forEach((e) => {
                const elem = document.getElementById(e.id);
                this.toggleVisibilityRecursive(elem, 'hidden');
            });
            const elemSelected = document.getElementById(this.currentElement.id);
            elemSelected.style.visibility = 'visible';
            this.toggleVisibilityRecursive(elemSelected, 'visible');
            this.layersService.biomarkerCanvas.forEach((b: BiomarkerCanvas) => {
                const svgElem = document.getElementById(b.id.replace(ANNOTATION_PREFIX, ''));
                b.displayCanvas.style.visibility = svgElem.style.visibility;
            });
        }
    }

    public toggleAllBiomarkers(visibility: string): void {
        this.tree.forEach((e) => {
            const elem = document.getElementById(e.id);
            this.toggleVisibilityRecursive(elem, visibility);
        });
        this.layersService.biomarkerCanvas.forEach((b: BiomarkerCanvas) => {
            const svgElem = document.getElementById(b.id.replace(ANNOTATION_PREFIX, ''));
            b.displayCanvas.style.visibility = svgElem.style.visibility;
        });
    }
}
