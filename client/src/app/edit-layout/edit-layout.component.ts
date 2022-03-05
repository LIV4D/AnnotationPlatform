import { ToolboxService, TOOL_NAMES } from './toolbox/toolbox.service';
import { ZoomComponent } from './editor/zoom/zoom.component';
import { environment } from './../../environments/environment.prod';
import { EditorService } from './editor/editor.service';
import { AppService } from './../app.service';
import { HOTKEYS } from './../hotkeys';
import { LayersService } from './editor/layers/layers.service';
import { BiomarkersService } from './right-menu/biomarkers/biomarkers.service';
import { EditorComponent } from './editor/editor.component';
import { RightMenuComponent } from './right-menu/right-menu.component';
import { MatSidenav } from '@angular/material';
import { Component, OnInit, ViewChild, ChangeDetectorRef, AfterViewChecked } from '@angular/core';
import { DeviceDetectorService } from 'ngx-device-detector';
import { BioPicker } from '../model/biopicker';
import { Point } from '../model/point';
import { ToolPropertiesService } from './toolbox/tool-properties/tool-properties.service';

@Component({
    selector: 'app-edit-layout',
    templateUrl: './edit-layout.component.html',
    styleUrls: ['./edit-layout.component.scss']
})
export class EditLayoutComponent implements OnInit, AfterViewChecked {
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
    constructor(private cdRef: ChangeDetectorRef, public biomarkersService: BiomarkersService,
        public layersService: LayersService, public appService: AppService,
        public editorService: EditorService, public toolboxService: ToolboxService, public toolPropertiesService: ToolPropertiesService,
        public deviceService: DeviceDetectorService) {
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

    public flip(): void {
        this.editorComponent.flip();
    }

    public openBiomarkers(event: MouseEvent): void {
        if (! this.deviceService.isDesktop()) {
            return;
        }
        event.stopPropagation();
        const pickTool = this.toolboxService.listOfTools.filter((tool) => tool.name === TOOL_NAMES.BIO_PICKER)[0] as BioPicker;
        if (! pickTool.selectUnder(this.editorService.getMousePositionInCanvasSpace(new Point(event.x, event.y))) ) {
            //   Disable context menu. Replaced by fast switch to last biormarker
            // document.getElementById('bodyblack').style.opacity = '0.6';
            // this.editorService.menuState = true;
            // this.positionMenu(event);
            // this.toolboxService.listOfTools
            this.biomarkersService.setFocusBiomarker(this.biomarkersService.lastBiomarkers[0]);
        }
    }

    public getPosition(event: MouseEvent): any {
        let posx = 0;
        let posy = 0;
        if (event.pageX || event.pageY) {
            posx = event.pageX;
            posy = event.pageY;
        } else if (event.clientX || event.clientY) {
            posx = event.clientX + document.body.scrollLeft +
                document.documentElement.scrollLeft;
            posy = event.clientY + document.body.scrollTop +
                document.documentElement.scrollTop;
        }
        return { x: posx, y: posy };
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
        this.biomarkersService.setFocusBiomarker(item);
    }

    closeMenu(): void {
        this.editorService.menuState = false;
        document.getElementById('bodyblack').style.opacity = '0';
    }

    loadSVG(event: any): void {
        this.editorService.loadSVGLocal(event);
    }

    onMouseUp(event: MouseEvent): void {
        this.toolboxService.setUndoRedoState();
    }
    onKeyDown(event: KeyboardEvent): void {
        if (event.keyCode === HOTKEYS.KEY_CTRL_S_SAVE && this.commandOrCtrlPressed(event) ||
        event.keyCode === HOTKEYS.KEY_CTRL_Y_REDO && this.commandOrCtrlPressed(event)) {
            event.preventDefault();
        }
        if (this.appService.keyEventsEnabled && this.biomarkersService.flat !== undefined) {
            const current = this.biomarkersService.flat.filter((b) => b.id === this.biomarkersService.currentElement.id)[0];
            let index = this.biomarkersService.flat.indexOf(current);
            switch (event.keyCode) {
                case HOTKEYS.KEY_D_NEXT_CLASS: {
                    index = (index + 1) % this.biomarkersService.flat.length;
                    this.selectBiomarker(this.biomarkersService.flat[index]);
                    break;
                }
                case HOTKEYS.KEY_A_PREV_CLASS: {
                    index = index > 0 ? index - 1 : this.biomarkersService.flat.length - 1;
                    this.selectBiomarker(this.biomarkersService.flat[index]);
                    break;
                }
                case HOTKEYS.KEY_PLUS: {
                    if (event.altKey) {
                        this.editorService.zoom(+.2);
                    } else {
                        this.toolPropertiesService.incrementBrushWidth(1);
                    }
                    break;
                }
                case HOTKEYS.KEY_MINUS: {
                    if (event.altKey) {
                        this.editorService.zoom(-.2);
                    } else {
                        this.toolPropertiesService.incrementBrushWidth(-1);
                    }
                    break;
                }

                case HOTKEYS.KEY_LEFT: {
                    this.editorService.translate(-Math.round(200 / this.editorService.zoomFactor), 0);
                    break;
                }
                case HOTKEYS.KEY_RIGHT: {
                    this.editorService.translate(+Math.round(200 / this.editorService.zoomFactor), 0);
                    break;
                }
                case HOTKEYS.KEY_UP: {
                    this.editorService.translate(0, -Math.round(200 / this.editorService.zoomFactor));
                    break;
                }
                case HOTKEYS.KEY_DOWN: {
                    this.editorService.translate(0, +Math.round(200 / this.editorService.zoomFactor));
                    break;
                }
            }
        }
    }

    public commandOrCtrlPressed(event: KeyboardEvent): boolean {
        return navigator.platform.indexOf('Mac') === -1 ? event.ctrlKey : event.metaKey;
    }

    zoomSliderChange(event: any): void {
        const v = Math.pow(event.value / 100, 3);
        this.editorService.setZoomFactor(v);
    }

    updateSlider(zoomFactor: number): void {
        this.sliderZoom = Math.pow(zoomFactor, 1 / 3) * 100;
    }
}
