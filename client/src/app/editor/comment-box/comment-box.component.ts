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
  textAreaValue: string;

  @Input () mousePosition: Point;
  @ViewChild ('matAccordElement') matAccordElement: ElementRef;

  constructor(private renderer: Renderer2, public appService: AppService) {}

  ngOnInit(): void {
    this.textAreaValue = 'This is a test';
  }

  ngAfterViewInit(): void {
    this.updatePositionOfComment();
  }

  onChange(newValue) {
    console.log('%c Event Changes : ' + newValue, 'color:black;background:yellow;');
    this.appService.keyEventsEnabled = false;
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log(changes);
  }

  onMouseUp(e: Event) {
    // e.preventDefault();
    if (this.moving) {
      setTimeout(() => {
        this.isDisabled = false;
        this.down = false;
        this.moving = false;
      }, 100);
      this.pointFormat = 'example-box2';
    } else {
      // console.log('this.moving is false');
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

  updatePositionOfComment() {
    console.log('%c mousePos-xy : ' + this.mousePosition.x + ' y : ' + this.mousePosition.y, 'color:black;background:yellow;');
    this.renderer.setStyle(this.matAccordElement.nativeElement, 'margin-left', (this.mousePosition.x).toString()+'px');
    this.renderer.setStyle(this.matAccordElement.nativeElement, 'margin-top', (this.mousePosition.y).toString()+'px');
  }
}
