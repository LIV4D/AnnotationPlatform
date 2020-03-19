import { Component, OnInit, Output, EventEmitter, ViewChild,
        OnDestroy, ElementRef, AfterViewInit, Renderer2,
        ViewContainerRef } from '@angular/core';
import { EditorFacadeService } from './../editor.facade.service';
import { AppService } from 'src/app/shared/services/app.service';
import { Point } from 'src/app/shared/services/Editor/Tools/point.service';

@Component({
  selector: 'app-editor-content',
  templateUrl: './editor-content.component.html',
  styleUrls: ['./editor-content.component.scss']
})

export class EditorContentComponent implements OnInit, OnDestroy, AfterViewInit {

  constructor(public editorFacadeService: EditorFacadeService,
              public appService: AppService,
              private renderer: Renderer2) {
    this.delayEventTimer = null;
  }

  image: HTMLImageElement;
  zoomFactor: number;
  offsetX: number;
  offsetY: number;
  cursorDown = false;
  middleMouseDown = false;
  touchFreeze = false;
  zoomInitPoint: Point;
  zoomInitFactor: number;
  delayEventTimer: any;
  delayedEventHandler: Function;
  // Comment-box array
  commentBoxes = [];

  @ViewChild('editorBox') viewPort: ElementRef;
  @ViewChild('svgBox') svgBox: ElementRef;
  @ViewChild('mainCanvas') mainCanvas: ElementRef;
  @ViewChild('commentBox', {read: ViewContainerRef}) commentBox: ViewContainerRef;

  @Output() svgLoaded: EventEmitter<any> = new EventEmitter();

  ngOnInit(): void {
  }

  ngAfterViewInit() {
    // console.log('EditorContent::ngOnInit()');
    // console.log('%c editorBox: ' + this.viewPort, 'color: black; background: yellow;');
    // console.log('%c svgBox: ' + this.svgBox, 'color: black; background: yellow;');

    this.editorFacadeService.init(this.svgLoaded, this.viewPort, this.svgBox);
    this.svgLoaded.emit();
    // this.editorFacadeService.load(imageId); // I don't know why this is here
    // this.toolboxService.listOfTools.filter((tool) => tool.name === TOOL_NAMES.UNDO)[0].disabled = true;
    // this.toolboxService.listOfTools.filter((tool) => tool.name === TOOL_NAMES.REDO)[0].disabled = true;
  }

  ngOnDestroy(): void {
    this.image = null;
    this.cursorDown = false;
    this.middleMouseDown = false;
    this.zoomInitFactor = null;
  }

  onMouseWheel(event: WheelEvent): void {
    // console.log('EditorContent::onMouseWheel()');

    const position = this.getMousePositionInCanvasSpace(new Point(event.clientX, event.clientY));
    // delta is used to lower the zooming speed
    const delta = - event.deltaY * (navigator.userAgent.indexOf('Firefox') !== -1 ? 4 : 0.25) / 500;

    if (!this.cursorDown && !this.editorFacadeService.firstPoint && event.ctrlKey === false) {
      this.editorFacadeService.zoom(delta, position);
    }
  }

  onMouseDown(event: MouseEvent): void {

    // Dynamically create new comment-box
    this.addNewCommentBox();

    this.cursorDown = true;
    if (event.which === 2 && !this.editorFacadeService.menuState) {
      // const panTool = this.toolboxFacadeService.listOfTools.filter((tool) => tool.name === TOOL_NAMES.PAN)[0];
      const panTool = this.editorFacadeService.panTool;
      panTool.onCursorDown(this.getMousePositionInCanvasSpace(new Point(event.clientX, event.clientY)));
      this.middleMouseDown = true;
    } else if (event.which === 1 && !this.editorFacadeService.menuState && !this.middleMouseDown) {
      this.editorFacadeService.onCursorDownToolbox(this.getMousePositionInCanvasSpace(new Point(event.clientX, event.clientY)));
    }
    // this.enableKeyEvents(false);
  }

  addNewCommentBox() {



    console.log('Comment box created!');
  }

  onMouseUp(event: MouseEvent): void {
    this.cursorDown = false;
    if (event.which === 2 && !this.editorFacadeService.menuState) {
      // const panTool = this.toolboxService.listOfTools.filter((tool) => tool.name === TOOL_NAMES.PAN)[0];
      const panTool = this.editorFacadeService.panTool;
      panTool.onCursorUp();
      this.middleMouseDown = false;
    } else if (!this.middleMouseDown) {
      this.editorFacadeService.onCursorUpToolbox();
    }
    // this.enableKeyEvents(true);
  }

  onMouseMove(event: MouseEvent): void {
    if (this.middleMouseDown) {
      // const panTool = this.editorFacadeService.listOfTools.filter((tool) => tool.name === TOOL_NAMES.PAN)[0];
      const panTool = this.editorFacadeService.panTool;
      panTool.onCursorMove(this.getMousePositionInCanvasSpace(new Point(event.clientX, event.clientY)));
    } else {
      this.editorFacadeService.onCursorMoveToolbox(this.getMousePositionInCanvasSpace(new Point(event.clientX, event.clientY)));
    }
  }

  onMouseLeave(event: MouseEvent): void {
    if (event.which === 2 && !this.editorFacadeService.menuState) {
      // const panTool = this.toolboxService.listOfTools.filter((tool) => tool.name === TOOL_NAMES.PAN)[0];
      const panTool = this.editorFacadeService.panTool;
      panTool.onCursorOut(this.getMousePositionInCanvasSpace(new Point(event.clientX, event.clientY)));
      this.middleMouseDown = false;
    }
    this.cursorDown = false;
    this.editorFacadeService.onCursorOutToolbox(this.getMousePositionInCanvasSpace(new Point(event.clientX, event.clientY)));
    // this.enableKeyEvents(true);
  }


  // onPointerDown(event: PointerEvent): void {
  //     this.delayEventHandling(() => {
  //         if (event.pointerType === 'pen') {
  //             this.appService.pointerDetected = true;
  //             // if (this.toolboxService.isBrushMutliplierRelevent) {
  //             //     this.toolPropertiesService.setBrushWidthMultiplier(event.pressure);
  //             // }
  //         }
  //         this.onMouseMove(event);
  //     });
  // }

  // onPointerMove(event: PointerEvent): void {
  //     this.delayEventHandling(() => {
  //         if (event.pointerType === 'pen') {
  //             this.appService.pointerDetected = true;
  //             // if (this.toolboxService.isBrushMutliplierRelevent) {
  //             //     this.toolPropertiesService.setBrushWidthMultiplier(event.pressure);
  //             // }
  //         }
  //         this.onMouseMove(event);
  //     });
  // }

  // onPointerUp(event: PointerEvent): void {
  //     this.clearDelayedEventHandling();
  //     this.onMouseUp(event);
  //     // if (this.toolboxService.isBrushMutliplierRelevent) {
  //     //     this.toolPropertiesService.setBrushWidthMultiplier(0);
  //     // }
  // }

  // onPointerLeave(event: PointerEvent): void {
  //     this.clearDelayedEventHandling();
  //     this.onMouseLeave(event);
  //     // if (this.toolboxService.isBrushMutliplierRelevent) {
  //     //     this.toolPropertiesService.setBrushWidthMultiplier(0);
  //     // }
  // }

  // onTouchStart(event: TouchEvent): void {
  //     if (this.touchFreeze) {
  //         return;
  //     }
  //     if (event.targetTouches.length === 1) {
  //         // cursor down event
  //         const touch = event.targetTouches[0];
  //         this.cursorDown = true;
  //         // this.toolboxService.onCursorDown(this.getMousePositionInCanvasSpace(new Point(touch.clientX, touch.clientY)));
  //         this.enableKeyEvents(false);
  //     } else if (event.targetTouches.length === 2) {
  //         // Cancel tool
  //         // this.toolboxService.onCancel();
  //         this.cursorDown = false;

  //         // Start zoom & move
  //         const touches = event.targetTouches;
  //         const x0 = touches[0].clientX;
  //         const x1 = touches[1].clientX;
  //         const y0 = touches[0].clientY;
  //         const y1 = touches[1].clientY;
  //         const midPoint = new Point( (x0 + x1) / 2, (y0 + y1) / 2);
  //         this.zoomInitPoint = this.getMousePositionInCanvasSpace(midPoint);
  //         this.zoomInitFactor = this.zoomFactor / Math.sqrt((x1 - x0) * (x1 - x0) + (y1 - y0) * (y1 - y0));
  //     } else {
  //         this.touchFreeze = true;
  //         if (this.cursorDown) {
  //             // this.toolboxService.onCancel();
  //             this.cursorDown = false;
  //         }
  //     }
  // }

  // onTouchMove(event: TouchEvent): void {
  //     if (!this.touchFreeze) {
  //         if (event.targetTouches.length === 1) {
  //             if ( this.cursorDown) {
  //                 // Update tool
  //                 // if (this.deviceService.isDesktop()) {
  //                     this.handleTouchMove(event);
  //                 // } else {
  //                 //     if (this.delayEventTimer === null) {
  //                 //         this.delayEventTimer = setTimeout( () => {
  //                 //             this.delayEventTimer = null;
  //                 //         }, 50);
  //                 //         this.handleTouchMove(event);
  //                 //     }
  //                 // }
  //             }
  //         } else if (event.targetTouches.length === 2) {
  //             const touches = event.targetTouches;
  //             const x0 = touches[0].clientX;
  //             const x1 = touches[1].clientX;
  //             const y0 = touches[0].clientY;
  //             const y1 = touches[1].clientY;
  //             const midPoint = new Point( (x0 + x1) / 2, (y0 + y1) / 2);
  //             const zoomFactor = this.zoomInitFactor * Math.sqrt((x1 - x0) * (x1 - x0) + (y1 - y0) * (y1 - y0));

  //             // TODO: perform zoom
  //         }
  //     }
  // }

  // handleTouchMove(event: TouchEvent): void {
  //     const touch = event.targetTouches[0];
  //     // this.toolboxService.onCursorMove(this.getMousePositionInCanvasSpace(new Point(touch.clientX, touch.clientY)));
  // }

  // delayEventHandling(eventHandler: Function): void {
  //     if (this.delayEventTimer === null) {
  //         eventHandler();
  //         // const timeout = this.deviceService.isDesktop() ? 5 : 50;
  //         const timeout = 5;
  //         this.delayEventTimer = setTimeout(() => {
  //             while (this.delayedEventHandler) {
  //                 this.delayedEventHandler();
  //                 this.delayedEventHandler = null;
  //             }
  //             this.delayEventTimer = null;
  //         }, timeout);
  //     } else {
  //         this.delayedEventHandler = eventHandler;
  //     }
  // }

  // clearDelayedEventHandling(): void {
  //     if (this.delayEventTimer !== null) {
  //         clearTimeout(this.delayEventTimer);
  //         this.delayEventTimer = null;
  //         if (this.delayedEventHandler) {
  //             this.delayedEventHandler();
  //         }
  //     }
  // }

  // onTouchEnd(event: TouchEvent): void {
  //     if (this.touchFreeze) {
  //         if (event.targetTouches.length === 0) {
  //             this.touchFreeze = false;
  //         }
  //         return;
  //     }

  //     if (event.targetTouches.length === 0) {
  //         // this.toolboxService.onCursorUp();
  //         this.enableKeyEvents(true);
  //     } else {
  //         this.touchFreeze = true;
  //         // this.toolboxService.onCancel();
  //     }
  //     this.cursorDown = false;
  // }

  // onTouchCancel(event: TouchEvent): void {
  //     for (let i = 0; i < event.targetTouches.length; i++) {
  //         const t = event.targetTouches[i];
  //     }
  // }

  // flip(): void {
  //     this.editorService.scaleX *= -1;
  // }

  onResize(): void {
      this.editorFacadeService.resize();
  }

  getMousePositionInCanvasSpace(clientPosition: Point): Point {
    if (!this.editorFacadeService.backgroundCanvas) { return undefined; }
    let clientX: number;
    let clientY: number;
    // X coordinate is adjusted if the image is flipped horizontally.
    clientX = this.editorFacadeService.scaleX === 1
      ? clientPosition.x - this.viewPort.nativeElement.getBoundingClientRect().left
      : this.viewPort.nativeElement.clientWidth - clientPosition.x + this.viewPort.nativeElement.getBoundingClientRect().left;

    clientY = clientPosition.y - this.viewPort.nativeElement.getBoundingClientRect().top;
    const canvasX = clientX * this.editorFacadeService.backgroundCanvas.displayCanvas.width /
      this.editorFacadeService.backgroundCanvas.displayCanvas.getBoundingClientRect().width;
    const canvasY = clientY * this.editorFacadeService.backgroundCanvas.displayCanvas.height /
      this.editorFacadeService.backgroundCanvas.displayCanvas.getBoundingClientRect().height;
    return new Point(canvasX, canvasY);
  }

  // enableKeyEvents(enable: boolean): void {
  //     if (this.editorService.layersService.firstPoint) {
  //         this.appService.keyEventsEnabled = false;
  //     } else {
  //         this.appService.keyEventsEnabled = enable;
  //     }
  // }
}
