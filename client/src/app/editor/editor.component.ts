import { Component, OnInit, ViewChild, ChangeDetectorRef} from '@angular/core';
import { RightMenuComponent } from './right-menu/right-menu.component';
import { LayersService } from '../shared/services/Editor/layers.service';
import { EditorFacadeService } from './editor.facade.service';
import { AppService } from '../shared/services/app.service';
import { MatSidenav } from '@angular/material/sidenav';
import { BiomarkersFacadeService } from './right-menu/biomarkers/biomarkers.facade.service';
import { ToolboxFacadeService } from './toolbox/toolbox.facade.service';
import { TOOL_NAMES } from './../shared/constants/tools';
import { BioPicker } from './../shared/services/Editor/Tools/biopicker.service';
import { Point } from './../shared/services/Editor/Tools/point.service';

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss']
})
export class EditorComponent implements OnInit {

  @ViewChild('toolsNav') toolsNav: MatSidenav;
  @ViewChild('rightMenuNav') rightMenuNav: MatSidenav;
  @ViewChild('rightMenu') rightMenu: RightMenuComponent;
  @ViewChild('editor') editorComponent: EditorComponent;
  @ViewChild('contextMenu') contextMenu: any;
  menuPosition: any;
  menuPositionX: string;
  menuPositionY: string;
  menuWidth: number;
  menuHeight: number;
  innerHeight: number;
  innerWidth: number;
  windowWidth: number;
  windowHeight: number;
  sliderZoom: number;

  constructor(private cdRef: ChangeDetectorRef, public appService: AppService,
              public editorFacadeService: EditorFacadeService, public biomarkersFacadeService: BiomarkersFacadeService,
              public toolboxFacadeService: ToolboxFacadeService) {
    this.sliderZoom = 0;
  }

  ngOnInit(): void {

  }

  ngAfterViewChecked(): void {
    this.cdRef.detectChanges();
  }

  public onSvgLoaded(arbre: SVGGElement[]): void {
    this.rightMenu.svgLoaded(arbre);
  }

  public openBiomarkers(event: MouseEvent): void {
      event.stopPropagation();
      const pickTool = this.toolboxFacadeService.listOfTools.filter((tool) => tool.name === TOOL_NAMES.BIO_PICKER)[0] as BioPicker;
      if (! pickTool.selectUnder(this.editorFacadeService.getMousePositionInCanvasSpace(new Point(event.x, event.y))) ) {
          document.getElementById('bodyblack').style.opacity = '0.6';
          this.editorFacadeService.menuState = true;
          this.positionMenu(event);
      }
  }

  public positionMenu(clientPos): void {
      const appEditor = document.getElementById('edit-viewport');
      this.menuPosition = clientPos;
      this.menuPositionX = this.menuPosition.x;
      this.menuPositionY = this.menuPosition.y;

      this.menuWidth = this.contextMenu.nativeElement.offsetWidth;
      this.menuHeight = this.contextMenu.nativeElement.offsetHeight;
      this.windowWidth = appEditor.offsetWidth;
      this.windowHeight = appEditor.offsetHeight;

      if ((this.windowWidth - (Number(this.menuPositionX) - appEditor.getBoundingClientRect().left)) < this.menuWidth) {
          this.menuPositionX = Number(this.windowWidth - this.menuWidth) + 'px';
      } else {
          this.menuPositionX = Number(this.menuPositionX) - appEditor.getBoundingClientRect().left + 'px';
      }
      if ((this.windowHeight - (Number(this.menuPositionY) - appEditor.getBoundingClientRect().top)) < this.menuHeight) {
          this.menuPositionY = this.windowHeight - this.menuHeight + 'px';
      } else {
          this.menuPositionY = Number(this.menuPositionY) - appEditor.getBoundingClientRect().top + 'px';
      }
  }

  selectBiomarker(item: HTMLElement): void {
      this.editorFacadeService.setFocusBiomarker(item);
  }


   onMouseUp(event: MouseEvent): void {
       this.toolboxFacadeService.setUndoRedoState();
   }

  // public commandOrCtrlPressed(event: KeyboardEvent): boolean {
  //     return navigator.platform.indexOf('Mac') === -1 ? event.ctrlKey : event.metaKey;
  // }

  // this only works for mobile (when using the slider)
  // zoomSliderChange(event: any): void {
  //     const v = Math.pow(event.value / 100, 3);
  //     this.editorService.setZoomFactor(v);
  //     console.log('zoomSliderChange() was called');
  // }

  // updateSlider(zoomFactor: number): void {
  //     this.sliderZoom = Math.pow(zoomFactor, 1 / 3) * 100;
  // }
}
