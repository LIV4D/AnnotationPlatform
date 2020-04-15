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

  constructor(private cdRef: ChangeDetectorRef,
              public layersService: LayersService, public appService: AppService,
              public editorFacadeService: EditorFacadeService, public biomarkersFacadeService: BiomarkersFacadeService,
              public toolboxFacadeService: ToolboxFacadeService) {
    this.sliderZoom = 0;
  }

  ngOnInit(): void {
    // this.rightMenu.svgLoaded(null);

  }

  ngAfterViewChecked(): void {
    this.cdRef.detectChanges();
  }

  public onSvgLoaded(arbre: SVGGElement[]): void {
    // console.log('EditorComponent::onSvgLoaded()');
    this.rightMenu.svgLoaded(arbre);
  }

  public openBiomarkers(event: MouseEvent): void {
      // if (! this.deviceService.isDesktop()) {
      //     return;
      // }
      event.stopPropagation();
      const pickTool = this.toolboxFacadeService.listOfTools.filter((tool) => tool.name === TOOL_NAMES.BIO_PICKER)[0] as BioPicker;
      if (! pickTool.selectUnder(this.editorFacadeService.getMousePositionInCanvasSpace(new Point(event.x, event.y))) ) {
          document.getElementById('bodyblack').style.opacity = '0.6';
          this.editorFacadeService.menuState = true;
          this.positionMenu(event);
      }
  }

  // public getPosition(event: MouseEvent): any {
  //     let posx = 0;
  //     let posy = 0;
  //     if (event.pageX || event.pageY) {
  //         posx = event.pageX;
  //         posy = event.pageY;
  //     } else if (event.clientX || event.clientY) {
  //         posx = event.clientX + document.body.scrollLeft +
  //             document.documentElement.scrollLeft;
  //         posy = event.clientY + document.body.scrollTop +
  //             document.documentElement.scrollTop;
  //     }
  //     return { x: posx, y: posy };
  // }

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

  // closeMenu(): void {
  //     this.editorService.menuState = false;
  //     document.getElementById('bodyblack').style.opacity = '0';
  // }

  //loadSVG(event: any): void {
  //    this.editorFacadeService.loadSVGLocal(event);
  //}

   onMouseUp(event: MouseEvent): void {
       this.toolboxFacadeService.setUndoRedoState();
   }
  // onKeyDown(event: KeyboardEvent): void {
  //     if (event.keyCode === HOTKEYS.KEY_CTRL_S_SAVE && this.commandOrCtrlPressed(event) ||
  //     event.keyCode === HOTKEYS.KEY_CTRL_Y_REDO && this.commandOrCtrlPressed(event)) {
  //         event.preventDefault();
  //     }
  //     if (this.appService.keyEventsEnabled && this.biomarkersService.flat !== undefined) {
  //         const current = this.biomarkersService.flat.filter((b) => b.id === this.biomarkersService.currentElement.id)[0];
  //         let index = this.biomarkersService.flat.indexOf(current);
  //         switch (event.keyCode) {
  //             case HOTKEYS.KEY_D_NEXT_CLASS: {
  //                 index = (index + 1) % this.biomarkersService.flat.length;
  //                 this.selectBiomarker(this.biomarkersService.flat[index]);
  //                 break;
  //             }
  //             case HOTKEYS.KEY_A_PREV_CLASS: {
  //                 index = index > 0 ? index - 1 : this.biomarkersService.flat.length - 1;
  //                 this.selectBiomarker(this.biomarkersService.flat[index]);
  //                 break;
  //             }
  //             case HOTKEYS.KEY_PLUS: {
  //                 if (event.altKey) {
  //                     this.editorService.zoom(+.2);
  //                 } else {
  //                     this.toolPropertiesService.incrementBrushWidth(1);
  //                 }
  //                 break;
  //             }
  //             case HOTKEYS.KEY_MINUS: {
  //                 if (event.altKey) {
  //                     this.editorService.zoom(-.2);
  //                 } else {
  //                     this.toolPropertiesService.incrementBrushWidth(-1);
  //                 }
  //                 break;
  //             }

  //             case HOTKEYS.KEY_LEFT: {
  //                 this.editorService.translate(-Math.round(200 / this.editorService.zoomFactor), 0);
  //                 break;
  //             }
  //             case HOTKEYS.KEY_RIGHT: {
  //                 this.editorService.translate(+Math.round(200 / this.editorService.zoomFactor), 0);
  //                 break;
  //             }
  //             case HOTKEYS.KEY_UP: {
  //                 this.editorService.translate(0, -Math.round(200 / this.editorService.zoomFactor));
  //                 break;
  //             }
  //             case HOTKEYS.KEY_DOWN: {
  //                 this.editorService.translate(0, +Math.round(200 / this.editorService.zoomFactor));
  //                 break;
  //             }
  //         }
  //     }
  // }

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
