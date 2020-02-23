import { Component, OnInit, Output, EventEmitter, ViewChild } from '@angular/core';
import { EditorService } from 'src/app/shared/services/Editor/editor.service';
import { AppService } from 'src/app/shared/services/app.service';
import { Point } from 'src/app/shared/models/point.model';

@Component({
  selector: 'app-editor-content',
  templateUrl: './editor-content.component.html',
  styleUrls: ['./editor-content.component.scss']
})

export class EditorContentComponent implements OnInit {

  constructor(public editorService: EditorService, public appService: AppService, ) {
        this.delayEventTimer = null;
     }

  image: HTMLImageElement;
  zoomFactor: number;
  offsetX: number;
  offsetY: number;
  @ViewChild('editorBox') viewPort: any;
  cursorDown = false;
  middleMouseDown = false;
  touchFreeze = false;
  zoomInitPoint: Point;
  zoomInitFactor: number;
  delayEventTimer: any;
  delayedEventHandler: Function;


  @Output() svgLoaded: EventEmitter<any> = new EventEmitter();

  ngOnInit(): void {
      this.editorService.init(this.svgLoaded);
      // this.toolboxService.listOfTools.filter((tool) => tool.name === TOOL_NAMES.UNDO)[0].disabled = true;
      // this.toolboxService.listOfTools.filter((tool) => tool.name === TOOL_NAMES.REDO)[0].disabled = true;
  }

  ngOnDestroy(): void {
      this.image = null;
      this.cursorDown = false;
      this.middleMouseDown = false;
      this.zoomInitFactor = null;
  }

  onMouseDown(event: MouseEvent): void {
      this.cursorDown = true;
      if (event.which === 2 && !this.editorService.menuState) {
          // const panTool = this.toolboxService.listOfTools.filter((tool) => tool.name === TOOL_NAMES.PAN)[0];
          // panTool.onCursorDown(this.getMousePositionInCanvasSpace(new Point(event.clientX, event.clientY)));
          this.middleMouseDown = true;
      } else if (event.which === 1 && !this.editorService.menuState  && !this.middleMouseDown) {
          // this.toolboxService.onCursorDown(this.getMousePositionInCanvasSpace(new Point(event.clientX, event.clientY)));
      }
      this.enableKeyEvents(false);
  }

  onMouseUp(event: MouseEvent): void {
      this.cursorDown = false;
      if (event.which === 2 && !this.editorService.menuState) {
          // const panTool = this.toolboxService.listOfTools.filter((tool) => tool.name === TOOL_NAMES.PAN)[0];
          // panTool.onCursorUp();
          this.middleMouseDown = false;
      } else if (!this.middleMouseDown) {
          // this.toolboxService.onCursorUp();
      }
      this.enableKeyEvents(true);
  }

  onMouseMove(event: MouseEvent): void {
      if (this.middleMouseDown) {
          // const panTool = this.toolboxService.listOfTools.filter((tool) => tool.name === TOOL_NAMES.PAN)[0];
          // panTool.onCursorMove(this.getMousePositionInCanvasSpace(new Point(event.clientX, event.clientY)));
      } else {
          // this.toolboxService.onCursorMove(this.getMousePositionInCanvasSpace(new Point(event.clientX, event.clientY)));
      }
  }

  onMouseLeave(event: MouseEvent): void {
      if (event.which === 2 && !this.editorService.menuState) {
          // const panTool = this.toolboxService.listOfTools.filter((tool) => tool.name === TOOL_NAMES.PAN)[0];
          // panTool.onCursorOut(this.getMousePositionInCanvasSpace(new Point(event.clientX, event.clientY)));
          this.middleMouseDown = false;
      }
      this.cursorDown = false;
      // this.toolboxService.onCursorOut(this.getMousePositionInCanvasSpace(new Point(event.clientX, event.clientY)));
      this.enableKeyEvents(true);
  }

  onMouseWheel(event: WheelEvent): void {
      const position = this.getMousePositionInCanvasSpace(new Point(event.clientX, event.clientY));
      const delta = -event.deltaY * (navigator.userAgent.indexOf('Firefox') !== -1 ? 4 : 0.25 ) / 300;

      if (!this.cursorDown && !this.editorService.layersService.firstPoint && event.ctrlKey === false) {
          this.editorService.zoom(delta, position);
      } else if (!this.cursorDown && !this.editorService.layersService.firstPoint) {
          // let brushWidth =  this.toolPropertiesService.brushWidth;
          // const brushInc = delta > 0 ? 1 : -1;
          // if (brushWidth < 20) {
          //     brushWidth += brushInc;
          // } else {
          //     brushWidth += brushInc * brushWidth / 10;
          // }
          // brushWidth = Math.round(brushWidth);
          // this.toolPropertiesService.setBrushWidth(brushWidth);
      }
  }

  onPointerDown(event: PointerEvent): void {
      this.delayEventHandling(() => {
          if (event.pointerType === 'pen') {
              this.appService.pointerDetected = true;
              // if (this.toolboxService.isBrushMutliplierRelevent) {
              //     this.toolPropertiesService.setBrushWidthMultiplier(event.pressure);
              // }
          }
          this.onMouseMove(event);
      });
  }

  onPointerMove(event: PointerEvent): void {
      this.delayEventHandling(() => {
          if (event.pointerType === 'pen') {
              this.appService.pointerDetected = true;
              // if (this.toolboxService.isBrushMutliplierRelevent) {
              //     this.toolPropertiesService.setBrushWidthMultiplier(event.pressure);
              // }
          }
          this.onMouseMove(event);
      });
  }

  onPointerUp(event: PointerEvent): void {
      this.clearDelayedEventHandling();
      this.onMouseUp(event);
      // if (this.toolboxService.isBrushMutliplierRelevent) {
      //     this.toolPropertiesService.setBrushWidthMultiplier(0);
      // }
  }

  onPointerLeave(event: PointerEvent): void {
      this.clearDelayedEventHandling();
      this.onMouseLeave(event);
      // if (this.toolboxService.isBrushMutliplierRelevent) {
      //     this.toolPropertiesService.setBrushWidthMultiplier(0);
      // }
  }

  onTouchStart(event: TouchEvent): void {
      if (this.touchFreeze) {
          return;
      }
      if (event.targetTouches.length === 1) {
          // cursor down event
          const touch = event.targetTouches[0];
          this.cursorDown = true;
          // this.toolboxService.onCursorDown(this.getMousePositionInCanvasSpace(new Point(touch.clientX, touch.clientY)));
          this.enableKeyEvents(false);
      } else if (event.targetTouches.length === 2) {
          // Cancel tool
          // this.toolboxService.onCancel();
          this.cursorDown = false;

          // Start zoom & move
          const touches = event.targetTouches;
          const x0 = touches[0].clientX;
          const x1 = touches[1].clientX;
          const y0 = touches[0].clientY;
          const y1 = touches[1].clientY;
          const midPoint = new Point( (x0 + x1) / 2, (y0 + y1) / 2);
          this.zoomInitPoint = this.getMousePositionInCanvasSpace(midPoint);
          this.zoomInitFactor = this.zoomFactor / Math.sqrt((x1 - x0) * (x1 - x0) + (y1 - y0) * (y1 - y0));
      } else {
          this.touchFreeze = true;
          if (this.cursorDown) {
              // this.toolboxService.onCancel();
              this.cursorDown = false;
          }
      }
  }

  onTouchMove(event: TouchEvent): void {
      if (!this.touchFreeze) {
          if (event.targetTouches.length === 1) {
              if ( this.cursorDown) {
                  // Update tool
                  // if (this.deviceService.isDesktop()) {
                      this.handleTouchMove(event);
                  // } else {
                  //     if (this.delayEventTimer === null) {
                  //         this.delayEventTimer = setTimeout( () => {
                  //             this.delayEventTimer = null;
                  //         }, 50);
                  //         this.handleTouchMove(event);
                  //     }
                  // }
              }
          } else if (event.targetTouches.length === 2) {
              const touches = event.targetTouches;
              const x0 = touches[0].clientX;
              const x1 = touches[1].clientX;
              const y0 = touches[0].clientY;
              const y1 = touches[1].clientY;
              const midPoint = new Point( (x0 + x1) / 2, (y0 + y1) / 2);
              const zoomFactor = this.zoomInitFactor * Math.sqrt((x1 - x0) * (x1 - x0) + (y1 - y0) * (y1 - y0));

              // TODO: perform zoom
          }
      }
  }

  handleTouchMove(event: TouchEvent): void {
      const touch = event.targetTouches[0];
      // this.toolboxService.onCursorMove(this.getMousePositionInCanvasSpace(new Point(touch.clientX, touch.clientY)));
  }

  delayEventHandling(eventHandler: Function): void {
      if (this.delayEventTimer === null) {
          eventHandler();
          // const timeout = this.deviceService.isDesktop() ? 5 : 50;
          const timeout = 5;
          this.delayEventTimer = setTimeout(() => {
              while (this.delayedEventHandler) {
                  this.delayedEventHandler();
                  this.delayedEventHandler = null;
              }
              this.delayEventTimer = null;
          }, timeout);
      } else {
          this.delayedEventHandler = eventHandler;
      }
  }

  clearDelayedEventHandling(): void {
      if (this.delayEventTimer !== null) {
          clearTimeout(this.delayEventTimer);
          this.delayEventTimer = null;
          if (this.delayedEventHandler) {
              this.delayedEventHandler();
          }
      }
  }

  onTouchEnd(event: TouchEvent): void {
      if (this.touchFreeze) {
          if (event.targetTouches.length === 0) {
              this.touchFreeze = false;
          }
          return;
      }

      if (event.targetTouches.length === 0) {
          // this.toolboxService.onCursorUp();
          this.enableKeyEvents(true);
      } else {
          this.touchFreeze = true;
          // this.toolboxService.onCancel();
      }
      this.cursorDown = false;
  }

  onTouchCancel(event: TouchEvent): void {
      for (let i = 0; i < event.targetTouches.length; i++) {
          const t = event.targetTouches[i];
      }
  }

  flip(): void {
      this.editorService.scaleX *= -1;
  }

  onResize(): void {
      this.editorService.resize();
  }

  getMousePositionInCanvasSpace(clientPosition: Point): Point {
      if (!this.editorService.backgroundCanvas) { return undefined; }
      let clientX: number;
      let clientY: number;
      // X coordinate is adjusted if the image is flipped horizontally.
      clientX = this.editorService.scaleX === 1
          ? clientPosition.x - this.viewPort.nativeElement.getBoundingClientRect().left
          : this.viewPort.nativeElement.clientWidth - clientPosition.x + this.viewPort.nativeElement.getBoundingClientRect().left;

      clientY = clientPosition.y - this.viewPort.nativeElement.getBoundingClientRect().top;
      const canvasX = clientX * this.editorService.backgroundCanvas.displayCanvas.width /
          this.editorService.backgroundCanvas.displayCanvas.getBoundingClientRect().width;
      const canvasY = clientY * this.editorService.backgroundCanvas.displayCanvas.height /
          this.editorService.backgroundCanvas.displayCanvas.getBoundingClientRect().height;
      return new Point(canvasX, canvasY);
  }

  enableKeyEvents(enable: boolean): void {
      if (this.editorService.layersService.firstPoint) {
          this.appService.keyEventsEnabled = false;
      } else {
          this.appService.keyEventsEnabled = enable;
      }
  }



  // TODO : Mine
  // @Output() svgLoaded: EventEmitter<any> = new EventEmitter();

  // constructor(public editorService: EditorService) { }

  // ngOnInit(): void {
  //   console.log('EditorContentComponent::ngOnInit()');
  //   this.editorService.init(this.svgLoaded);
  // }

}
