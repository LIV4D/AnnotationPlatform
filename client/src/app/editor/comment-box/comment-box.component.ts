import {
  Component,
  OnInit,
  Input,
  ViewChild,
  ElementRef,
  Renderer2,
  AfterViewInit,
} from '@angular/core';
import { Point } from 'src/app/shared/services/Editor/Tools/point.service';

@Component({
  selector: 'app-comment-box',
  templateUrl: './comment-box.component.html',
  styleUrls: ['./comment-box.component.scss'],
})
export class CommentBoxComponent implements OnInit, AfterViewInit {
  panelOpenState = false;
  isDisabled = false;
  up = false;
  down = false;
  moving = false;
  pointFormat = 'example-box2';
  textAreaValue: string;

  @Input () mousePosition: Point;
  @ViewChild ('matAccordElement') matAccordElement: ElementRef;

  constructor(private renderer: Renderer2) {}

  ngOnInit(): void {
    this.textAreaValue = 'This is a test';
  }

  ngAfterViewInit(): void {
    console.log('%c mousePos-xy : ' + this.mousePosition.x + ' y : ' + this.mousePosition.y, 'color:black;background:yellow;');

    this.renderer.setStyle(this.matAccordElement.nativeElement, 'margin-left', (this.mousePosition.x).toString()+'px');
    this.renderer.setStyle(this.matAccordElement.nativeElement, 'margin-top', (this.mousePosition.y).toString()+'px');
  }

  // ngOnChanges(changes: SimpleChanges): void {
  //   console.log('Event Changes' + changes);
  //   console.log('%c value of pos_xy : ' + this.mousePosition.x, 'color:black;background:red;');
  //   console.log('%c value of pos_xy : ' + this.mousePosition.y, 'color:black;background:red;');
  //   console.log(changes);
  //   // console.log(this.textArea.element.nativeElement);
  // }

  onMouseUp(e: Event) {
    // e.preventDefault();
    // console.log('commentBox -- mouse up');
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
    // console.log('commentBox -- mouse down');
    this.down = true;
    this.pointFormat = 'nothing';
    // this.isDisabled = false;
  }

  onMouseMove(e: Event) {
    console.log('commentBox -- mouse move');
    if (this.down) {
      this.isDisabled = true;
      this.moving = true;
    }
    // console.log('%c value of pos_xy : ' + this.mousePosition.x, 'color:black;background:red;');
    // console.log('%c value of pos_xy : ' + this.mousePosition.y, 'color:black;background:red;');
  }

  onFormClick(e: Event) {
    // console.log('commentBox -- textarea clicked');
    this.pointFormat = 'nothing';
  }

  getMousePosition(): Point {
    return this.mousePosition;
  }
}
