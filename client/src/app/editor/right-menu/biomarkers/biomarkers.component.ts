import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { BiomarkersFacadeService } from './biomarkers.facade.service';
import { AppService } from './../../../shared/services/app.service';
import { MatDialog } from '@angular/material/dialog';
import { CamelCaseToTextPipe } from './../../../shared/pipes/camel-case-to-text.pipe';
import { MatList } from '@angular/material/list';
import { MatListModule } from '@angular/material/list';
import { Biomarker } from 'src/app/shared/models/biomarker.model';
import { CdkAccordion } from '@angular/cdk/accordion';
import { BioNode } from './../../../shared/models/bionode.model';
import {NestedTreeControl} from '@angular/cdk/tree';
import {MatTreeNestedDataSource} from '@angular/material/tree';
import { BiomarkersDialogComponent } from './biomarkers-dialog/biomarkers-dialog.component';

export interface DialogData {
  confirmDelete: boolean;
}

@Component({
  selector: 'app-biomarkers',
  templateUrl: './biomarkers.component.html',
  styleUrls: ['./biomarkers.component.scss']
})
export class BiomarkersComponent implements OnInit {

  confirmDelete: boolean;
  simplifiedView: boolean;
  arbre: SVGGElement[];
  visibilityAll: string;

  readonly VISIBILITY = 'visibility';
  readonly VISIBILITY_OFF = 'visibility_off';
  readonly BORDERS = 'border_outer';
  readonly BORDERS_OFF = 'border_clear';
  opacity: number;
  shadowsChecked: boolean;

  tree: BioNode[];

  treeControl = new NestedTreeControl<BioNode>(node => node.biomarkers);
  treeDataSource = new MatTreeNestedDataSource<BioNode>();

  constructor(public biomarkersFacadeService: BiomarkersFacadeService,
              public dialog: MatDialog, public appService: AppService, public camelCaseToTextPipe: CamelCaseToTextPipe,
              private changeDetector: ChangeDetectorRef) {

    this.biomarkersFacadeService.showBorders = false;
    this.opacity = 65;
    this.visibilityAll = 'visible';
    this.shadowsChecked = false;
    this.simplifiedView = true;
    this.tree = this.biomarkersFacadeService.tree;
    this.treeDataSource.data = this.tree;
  }

  ngOnInit(): void {
  }

  public init(arbre: SVGGElement[]): void {
    this.opacity = 65;
    this.arbre = arbre;
    // this.biomarkersFacadeService.init(arbre);
    this.biomarkersFacadeService.changeOpacity(this.opacity.toString());
  }

  hasChild = (_: number, node: BioNode) => !!node.biomarkers && node.biomarkers.length > 0;

  // public getCssClass(elem: HTMLElement): string {
  //   return this.biomarkersFacadeService.getCssClass(elem);
  // }

  get dataSource() {
    return this.biomarkersFacadeService.dataSourceJson;
  }

  get dataSourceSimpleView(){
    return this.biomarkersFacadeService.dataSourceSimpleView;
  }

  // Makes a biomarker the currently selected biomarker
  public setFocusBiomarker(node: Biomarker): void {
    this.biomarkersFacadeService.setFocusBiomarker(node);
  }

  // Transforms from camel case to text case
  public transform(value: string): string {
    return this.camelCaseToTextPipe.transform(value);
  }

  // Opens a popup to confirm deletion of biomarkers
  public openConfirmDelete(node: BioNode, event: MouseEvent): void {
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
        this.deleteElement(node.type);
      }
    });
  }

  public deleteElement(type: string): void {
    this.biomarkersFacadeService.deleteElements(type);
  }

  toggleVisibility(node: any): void {
    this.biomarkersFacadeService.toggleVisibility(node);
    // this.dataSource = this.biomarkersFacadeService.dataSourceJson;
    this.changeDetector.detectChanges();
  }

  public toggleSoloVisibility(node: Biomarker): void {
    this.biomarkersFacadeService.toggleSoloVisibility(node);
    // this.dataSource = this.biomarkersFacadeService.dataSourceJson;
    this.changeDetector.detectChanges();
  }

  public getVisibility(node: Biomarker): string {
    // const node = document.getElementById(elem.id);
    // if (node) {
    //   return (node.style.visibility === 'visible' || node.style.visibility === '') ? this.VISIBILITY : this.VISIBILITY_OFF;
    // } else {
    //   return '';
    // }
    // console.log(type.isVisible)
    return this.biomarkersFacadeService.getVisibility(node);

    // return node.isVisible ? this.VISIBILITY : this.VISIBILITY_OFF;
  }

  public getVisibilityAll(): string {
    return this.visibilityAll === 'hidden' ? this.VISIBILITY_OFF : this.VISIBILITY;
  }

  // returns the correct icon to display for edges
  public getBorders(): string {
    return this.biomarkersFacadeService.showBorders ? this.BORDERS : this.BORDERS_OFF;
  }

  public changeOpacity(event: any): void {
    if (event.type === 'input') {
      this.opacity = event.target.value;
      this.biomarkersFacadeService.changeOpacity(event.target.value.toString());
    } else {
      this.opacity = event.value;
      this.biomarkersFacadeService.changeOpacity(event.value.toString());
    }
  }

  // public hideOtherBiomarkers(): void {
  //   this.biomarkersFacadeService.hideOtherBiomarkers();
  // }

  public toggleAllBiomarkers(): void {
    this.visibilityAll = this.visibilityAll === 'visible' ? 'hidden' : 'visible';
    this.biomarkersFacadeService.toggleAllBiomarkers(this.visibilityAll);
  }

  public toggleBorders(): void {
    this.biomarkersFacadeService.showBorders = !this.biomarkersFacadeService.showBorders;
    this.biomarkersFacadeService.toggleBorders(this.biomarkersFacadeService.showBorders);
    if (this.biomarkersFacadeService.showBorders) {
      this.biomarkersFacadeService.changeOpacity('100');
      this.biomarkersFacadeService.toggleShadows(this.shadowsChecked);
    } else {
      this.biomarkersFacadeService.changeOpacity(this.opacity.toString());
      this.biomarkersFacadeService.toggleShadows(false);
    }
  }

  public toggleShadows(): void {
    this.shadowsChecked = !this.shadowsChecked;
    this.biomarkersFacadeService.toggleShadows(this.shadowsChecked);
  }

  public resetOpacity(): void {
    this.opacity = 50;
    this.biomarkersFacadeService.changeOpacity(this.opacity.toString());
  }

  enableOnKeyDown(): void {
    this.appService.keyEventsEnabled = true;
  }

  disableOnKeyDown(): void {
    this.appService.keyEventsEnabled = false;
  }

  public toggleSimplifiedView(): void {
    this.simplifiedView = !this.simplifiedView;
    this.tree = this.biomarkersFacadeService.tree;
    this.treeDataSource.data = this.tree;
    this.changeDetector.detectChanges();
  }

  public onKeyDown(event: KeyboardEvent): void {
    // if (this.appService.keyEventsEnabled) {
    //   switch (event.keyCode) {
    //     case HOTKEYS.KEY_H_HIDE_OTHERS: {
    //       this.hideOtherBiomarkers();
    //       break;
    //     }
    //     case HOTKEYS.KEY_L_TOGGLE_BORDERS: {
    //       this.toggleBorders();
    //       break;
    //     }
    //     case HOTKEYS.KEY_O_VIEW_ALL: {
    //       this.toggleAllBiomarkers();
    //       break;
    //     }
    //   }
    // }
  }

  shortenedTypeOf(node: BioNode){
    return this.biomarkersFacadeService.shortenedTypeOf(node);
  }

}
