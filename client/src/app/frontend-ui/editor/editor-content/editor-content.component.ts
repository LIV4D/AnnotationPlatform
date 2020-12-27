import { Component, OnInit, Output,
        EventEmitter, ViewChild, OnDestroy,
        ElementRef, AfterViewInit, ComponentFactoryResolver,
        ViewContainerRef,
} from '@angular/core';
import { EditorFacadeService } from '../editor.facade.service';
import { Point } from 'src/app/shared/models/point.model';
import { CommentBoxComponent } from '../comment-box/comment-box.component';
import { ToolboxFacadeService } from '../toolbox/toolbox.facade.service';
import { CommentBoxSingleton } from 'src/app/shared/models/comment-box-singleton.model';
import { Subscription } from 'rxjs';
import { CommentBoxService } from 'src/app/shared/services/editor/comment-box.service';
import { TOOL_NAMES } from 'src/app/shared/constants/tools';
import { CommentBoxFacadeService } from '../comment-box/comment-box.facade.service';

@Component({
  selector: 'app-editor-content',
  templateUrl: './editor-content.component.html',
  styleUrls: ['./editor-content.component.scss'],
})
export class EditorContentComponent
  implements OnInit, OnDestroy, AfterViewInit {
  constructor(
    public editorFacadeService: EditorFacadeService,
    private resolver: ComponentFactoryResolver,
    private toolBoxFacadeService: ToolboxFacadeService,
    private commentBoxFacadeService: CommentBoxFacadeService
  ) {
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
  commentBoxes: CommentBoxSingleton;
  commentClickObservable: Subscription;
  commentFiredObservable: Subscription;
  commentLoadEvent: Subscription;
  isCommentBoxExists = 0;
  canvasWidth = 0;
  canvasHeight = 0;

  @ViewChild('editorBox') viewPort: ElementRef;
  @ViewChild('svgBox') svgBox: ElementRef;
  @ViewChild('mainCanvas') mainCanvas: ElementRef;
  @ViewChild('commentBox', { read: ViewContainerRef })
  commentBox: ViewContainerRef;
  commentBoxCheck = false;

  @Output() svgLoaded: EventEmitter<any> = new EventEmitter();
  editorMousePos: Point;

  ngOnInit(): void {
    this.editorMousePos = new Point(0, 0);
    this.toolBoxFacadeService.listOfTools.filter((tool) => tool.name === TOOL_NAMES.COMMENT_TOOL)[0].disabled = true;
    this.commentBoxes = CommentBoxSingleton.getInstance();

    // we subscribe to the event click that will call for comment-box creation
    this.commentClickObservable = this.toolBoxFacadeService.getValueOfCommentBoxClicked().subscribe(
      (hasBeenClicked) => {
        if (hasBeenClicked) {
          this.createCommentBox();
          this.isCommentBoxExists = 1;
        }
      }
    );

    // we subscribe to the event that will take care of loading comment-boxes that were already saved in the server
    this.commentLoadEvent = this.editorFacadeService.commentHasBeenLoaded.subscribe(
      (loadedComments) => {
        const temp = loadedComments as string [];
        this.commentBoxes.comments = [];
        temp.forEach(comment => {
          this.createCommentBox(comment);
        });
      });

    // we subscribe to the checkbox event that shows or hide comment-boxes in the editor
    this.commentFiredObservable = this.commentBoxFacadeService.commentBoxTool.subscribe(
      (checkBoxClicked) => {
        this.commentBoxCheck = checkBoxClicked;
        if(!this.commentBoxCheck) {

          this.toolBoxFacadeService.listOfTools.forEach(element => {
            element.disabled = true;
          });
          this.toolBoxFacadeService.listOfTools.filter((tool) => tool.name === TOOL_NAMES.COMMENT_TOOL)[0].disabled = false;

          document.getElementById('boundary').style.zIndex = '300';
          document.getElementById('boundary').style.opacity = '1';
        } else {

          this.toolBoxFacadeService.listOfTools.forEach(element => {
            element.disabled = false;
          });
          this.toolBoxFacadeService.listOfTools.filter((tool) => tool.name === TOOL_NAMES.COMMENT_TOOL)[0].disabled = true;

          document.getElementById('boundary').style.zIndex = '0';
          document.getElementById('boundary').style.opacity = '0';
        }
      }
    );
  }

  ngAfterViewInit() {
    this.editorFacadeService.init(this.svgLoaded, this.viewPort, this.svgBox);
    this.svgLoaded.emit();
  }

  ngOnDestroy(): void {
    this.image = null;
    this.cursorDown = false;
    this.middleMouseDown = false;
    this.zoomInitFactor = null;
    if (!this.commentClickObservable.closed) {
      this.commentClickObservable.unsubscribe();
    }
    if (!this.commentLoadEvent.closed) {
      this.commentLoadEvent.unsubscribe();
    }
    if (!this.commentFiredObservable.closed) {
      this.commentFiredObservable.unsubscribe();
    }
  }

  onMouseWheel(event: WheelEvent): void {
    const position = this.getMousePositionInCanvasSpace(new Point(event.clientX, event.clientY));
    // delta is used to lower the zooming speed
    const delta = (-event.deltaY * (navigator.userAgent.indexOf('Firefox') !== -1 ? 4 : 0.25)) / 500;

    if (!this.cursorDown && !this.editorFacadeService.firstPoint && event.ctrlKey === false) {
      this.editorFacadeService.zoom(delta, position);
    }
  }

  onMouseDown(event: MouseEvent): void {
    this.cursorDown = true;
    if (event.which === 2 && !this.editorFacadeService.menuState) {
      const panTool = this.editorFacadeService.panTool;
      panTool.onCursorDown(this.getMousePositionInCanvasSpace(new Point(event.clientX, event.clientY)));
      this.middleMouseDown = true;
    } else if (event.which === 1 && !this.editorFacadeService.menuState && !this.middleMouseDown) {
      this.editorFacadeService.onCursorDownToolbox(this.getMousePositionInCanvasSpace(new Point(event.clientX, event.clientY)));
    }
  }

  createCommentBox(textArea?: string) {
    const factory = this.resolver.resolveComponentFactory(CommentBoxComponent);
    const componentRef = this.commentBox.createComponent(factory);
    this.commentBoxes.comments.push(componentRef.instance);

    this.canvasWidth = this.viewPort.nativeElement.clientWidth;
    this.canvasHeight = this.viewPort.nativeElement.clientHeight;

    componentRef.instance.mousePosition = this.editorMousePos;

    componentRef.instance.setDimensions(this.canvasWidth, this.canvasHeight);

    const comment = JSON.parse(localStorage.getItem('currentUser'));
    if(!this.commentBoxes.getUUID()) {
      this.commentBoxes.setUUID(comment.token);
    }

    if (textArea) {
      // componentRef.instance.textAreaValue = textArea;
      componentRef.instance.setText(textArea);

      // this is in order to keep comment-boxes from popping out out of the canvas borders
      let element: HTMLElement = <HTMLElement>componentRef.location.nativeElement;
      element.style.top= '150px';
    }

    this.editorFacadeService.setPanToolByString('pan');
    this.toolBoxFacadeService.listOfTools.filter((tool) => tool.name === TOOL_NAMES.COMMENT_TOOL)[0].disabled = true;
  }

  onMouseUp(event: MouseEvent): void {
    this.cursorDown = false;
    if (event.which === 2 && !this.editorFacadeService.menuState) {
      const panTool = this.editorFacadeService.panTool;
      panTool.onCursorUp();
      this.middleMouseDown = false;
    } else if (!this.middleMouseDown) {
      this.editorFacadeService.onCursorUpToolbox();
    }
  }

  onMouseMove(event: MouseEvent): void {
    if (this.middleMouseDown) {
      const panTool = this.editorFacadeService.panTool;
      panTool.onCursorMove(this.getMousePositionInCanvasSpace(new Point(event.clientX, event.clientY)));
    } else {
      this.editorFacadeService.onCursorMoveToolbox(this.getMousePositionInCanvasSpace(new Point(event.clientX, event.clientY)));
    }
  }

  onMouseLeave(event: MouseEvent): void {
    if (event.which === 2 && !this.editorFacadeService.menuState) {
      const panTool = this.editorFacadeService.panTool;
      panTool.onCursorOut(this.getMousePositionInCanvasSpace(new Point(event.clientX, event.clientY)));
      this.middleMouseDown = false;
    }
    this.cursorDown = false;
    this.editorFacadeService.onCursorOutToolbox(this.getMousePositionInCanvasSpace(new Point(event.clientX, event.clientY)));
  }

  onResize(): void {
    this.canvasWidth = this.viewPort.nativeElement.clientWidth;
    this.canvasHeight = this.viewPort.nativeElement.clientHeight;
    this.editorFacadeService.resize();
  }

  getMousePositionInCanvasSpace(clientPosition: Point): Point {
    if (!this.editorFacadeService.backgroundCanvas) {
      return undefined;
    }
    let clientX: number;
    let clientY: number;
    // X coordinate is adjusted if the image is flipped horizontally.
    clientX =
      this.editorFacadeService.scaleX === 1 ?
      clientPosition.x - this.viewPort.nativeElement.getBoundingClientRect().left :
      this.viewPort.nativeElement.clientWidth - clientPosition.x + this.viewPort.nativeElement.getBoundingClientRect().left;

    clientY = clientPosition.y - this.viewPort.nativeElement.getBoundingClientRect().top;
    const canvasX = (clientX * this.editorFacadeService.backgroundCanvas.displayCanvas.width) / this.editorFacadeService.backgroundCanvas.displayCanvas.getBoundingClientRect().width;
    const canvasY = (clientY * this.editorFacadeService.backgroundCanvas.displayCanvas.height) / this.editorFacadeService.backgroundCanvas.displayCanvas.getBoundingClientRect().height;

    // this binds to the pointer's x and y coordinates in comment-box components (child component)
    this.editorMousePos.x = clientPosition.x - this.viewPort.nativeElement.getBoundingClientRect().left;
    this.editorMousePos.y = clientPosition.y - this.viewPort.nativeElement.getBoundingClientRect().top;

    return new Point(canvasX, canvasY);
  }
}
