import {
  Component,
  OnInit,
  Input,
  ViewChild,
  ElementRef,
  Renderer2,
  AfterViewInit,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { Point } from 'src/app/shared/services/Editor/Tools/point.service';
import { AppService } from 'src/app/shared/services/app.service';

@Component({
  selector: 'app-comment-box',
  templateUrl: './comment-box.component.html',
  styleUrls: ['./comment-box.component.scss'],
})
export class CommentBoxComponent implements OnInit, AfterViewInit, OnChanges {
  panelOpenState = false;
  isDisabled = false;
  up = false;
  down = false;
  moving = false;
  pointFormat = 'example-box2';
  textAreaValue = '';
  canvasWidth: number;
  canvasHeight: number;
  isLoadingCommentFromServer: boolean;

  XLoaded: number;
  YLoaded: number;

  @Input () mousePosition: Point;
  @ViewChild ('matAccordElement') matAccordElement: ElementRef;

  constructor(private renderer: Renderer2, public appService: AppService) {}

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.updateCommentPosition();
  }

  onChange(newValue) {
    console.log('%c Event Changes : ' + newValue, 'color:black;background:yellow;');
    this.appService.keyEventsEnabled = false;
  }

  ngOnChanges(changes: SimpleChanges): void {
  }

  onMouseUp(e: Event) {
    if (this.moving) {
      setTimeout(() => {
        this.isDisabled = false;
        this.down = false;
        this.moving = false;
      }, 100);
      this.pointFormat = 'example-box2';
    } else {
    }
  }

  onMouseDown(e: Event) {
    this.down = true;
    this.pointFormat = 'nothing';
    // this.isDisabled = false;
  }

  onMouseMove(e: Event) {
    if (this.down) {
      this.isDisabled = true;
      this.moving = true;
    }
  }

  onFormClick(e: Event) {
    this.pointFormat = 'nothing';
  }

  onMouseLeave(e: Event) {
    this.appService.keyEventsEnabled = true;
  }

  getMousePosition(): Point {
    return this.mousePosition;
  }

  setDimensions(canvasWidth: number, canvasHeight: number) {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
  }

  updateCommentPosition( ) { // displayCanvas: HTMLCanvasElement, window?: DOMRect

    const posX = (( (this.mousePosition.x) / this.canvasWidth ) * 100);
    // const posY = (( (this.mousePosition.y) / this.canvasHeight ) * 100);
    // console.log('posY : ' + posY);

    this.renderer.setStyle(this.matAccordElement.nativeElement, 'margin-left', (posX).toString()+'%');
    // this.renderer.setStyle(this.matAccordElement.nativeElement, 'margin-top', (posY).toString()+'%');
    // this.renderer.setStyle(this.matAccordElement.nativeElement, 'margin-left', (this.mousePosition.x).toString()+'px');
    this.renderer.setStyle(this.matAccordElement.nativeElement, 'margin-top', (this.mousePosition.y).toString()+'px');
  }

  setText(textArea: string) {
    this.textAreaValue = textArea
  }

}
