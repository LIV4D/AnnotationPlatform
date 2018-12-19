import { CamelCaseToTextPipe } from './../../../pipes/camel-case-to-text.pipe';
import { AppService } from './../../../app.service';
import { HOTKEYS } from './../../../hotkeys';
import { ImageBorderService } from './image-border.service';
import { BiomarkersDialogComponent } from './biomarkers-dialog/biomarkers-dialog.component';
import { BiomarkersService } from './biomarkers.service';
import { Component } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';
import { MatDialog } from '@angular/material';

export interface DialogData {
    confirmDelete: boolean;
}

@Component({
    selector: 'app-biomarkers',
    templateUrl: './biomarkers.component.html',
    styleUrls: ['./biomarkers.component.scss']
})
export class BiomarkersComponent {
    confirmDelete: boolean;
    arbre: SVGGElement[];
    visibilityAll: string;

    readonly VISIBILITY = 'visibility';
    readonly VISIBILITY_OFF = 'visibility_off';
    readonly BORDERS = 'border_outer';
    readonly BORDERS_OFF = 'border_clear';
    opacity: number;

    constructor(public biomarkersService: BiomarkersService, public imageBorderService: ImageBorderService,
        public dialog: MatDialog, public appService: AppService, public camelCaseToTextPipe: CamelCaseToTextPipe) {
        this.imageBorderService.showBorders = false;
        this.opacity = 100;
        this.visibilityAll = 'visible';
    }

    public init(arbre: SVGGElement[]): void {
        this.arbre = arbre;
        this.biomarkersService.init(arbre);
    }

    public getCssClass(elem: HTMLElement): string {
        return this.biomarkersService.getCssClass(elem);
    }

    // Makes a biomarker the currently selected biomarker
    public setFocusBiomarker(elem: HTMLElement): void {
        this.biomarkersService.setFocusBiomarker(elem);
    }

    // Transforms from camel case to text case
    public transform(value: string): string {
        return this.camelCaseToTextPipe.transform(value);
    }

    // Opens a popup to confirm deletion of biomarkers
    public openConfirmDelete(node: HTMLElement, event: MouseEvent): void {
        const dialogPosition = {
            top: (event.y + 10) + 'px',
            left: (event.x - 70) + 'px'
        };

        const dialogRef = this.dialog.open(BiomarkersDialogComponent, {
            data: { confirm: this.confirmDelete },
            position: dialogPosition
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.deleteElement(node);
            }
        });
    }

    public deleteElement(elem: HTMLElement): void {
        this.biomarkersService.deleteElements(elem);
    }

    public toggleVisibility(id: string): void {
        this.biomarkersService.toggleVisibility(id);
    }

    public toggleSoloVisibility(id: string): void{
        this.biomarkersService.toggleSoloVisibility(id);
    }

    public getVisibility(elem: HTMLElement): string {
        const node = document.getElementById(elem.id);
        if (node) {
            return (node.style.visibility === 'visible' || node.style.visibility === '') ? this.VISIBILITY : this.VISIBILITY_OFF;
        } else {
            return '';
        }
    }

    public getVisibilityAll(): string {
        return this.visibilityAll === 'hidden' ? this.VISIBILITY_OFF : this.VISIBILITY;
    }

    // returns the correct icon to display for edges
    public getBorders(): string {
        return this.imageBorderService.showBorders ? this.BORDERS : this.BORDERS_OFF;
    }

    public changeOpacity(event: any): void {
        if (event.type === 'input') {
            this.opacity = event.target.value;
            this.biomarkersService.changeOpacity(event.target.value.toString());
        } else {
            this.opacity = event.value;
            this.biomarkersService.changeOpacity(event.value.toString());
        }
    }

    public hideOtherBiomarkers(): void {
        this.biomarkersService.hideOtherBiomarkers();
    }

    public toggleAllBiomarkers(): void {
        this.visibilityAll = this.visibilityAll === 'visible' ? 'hidden' : 'visible';
        this.biomarkersService.toggleAllBiomarkers(this.visibilityAll);
    }

    public toggleBorders(): void {
        this.imageBorderService.showBorders = !this.imageBorderService.showBorders;
        this.imageBorderService.toggleBorders(this.imageBorderService.showBorders);
    }

    public resetOpacity(): void {
        this.opacity = 100;
        this.biomarkersService.changeOpacity(this.opacity.toString());
    }

    enableOnKeyDown(): void {
        this.appService.keyEventsEnabled = true;
    }

    disableOnKeyDown(): void {
        this.appService.keyEventsEnabled = false;
    }

    public onKeyDown(event: KeyboardEvent): void {
        if (this.appService.keyEventsEnabled) {
            switch (event.keyCode) {
                case HOTKEYS.KEY_K_HIDE_OTHERS: {
                    this.hideOtherBiomarkers();
                    break;
                }
                case HOTKEYS.KEY_L_TOGGLE_BORDERS: {
                    this.toggleBorders();
                    break;
                }
                case HOTKEYS.KEY_O_VIEW_ALL: {
                    this.toggleAllBiomarkers();
                    break;
                }
            }
        }
    }
}


