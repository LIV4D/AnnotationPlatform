import {
  Component,
  OnInit,
  OnChanges,
  SimpleChanges,
  Input,
} from '@angular/core';
import { Point } from 'src/app/shared/services/Editor/Tools/point.service';

@Component({
  selector: 'app-comment-box',
  templateUrl: './comment-box.component.html',
  styleUrls: ['./comment-box.component.scss'],
})
export class CommentBoxComponent implements OnInit, OnChanges {
  panelOpenState = false;
  isDisabled = false;
  up = false;
  down = false;
  moving = false;
  pointFormat = 'example-box2';
  textAreaValue: string;

  @Input () mousePosition: Point;

  constructor() {}

  ngOnInit(): void {
    this.textAreaValue = 'This is a test';
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log('Event Changes' + changes);
    console.log('%c value of pos_xy : ' + this.mousePosition.x, 'color:black;background:red;');
    console.log('%c value of pos_xy : ' + this.mousePosition.y, 'color:black;background:red;');
    console.log(changes);
    // console.log(this.textArea.element.nativeElement);
  }

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
    console.log('%c value of pos_xy : ' + this.mousePosition.x, 'color:black;background:red;');
    console.log('%c value of pos_xy : ' + this.mousePosition.y, 'color:black;background:red;');
  }

  onFormClick(e: Event) {
    // console.log('commentBox -- textarea clicked');
    this.pointFormat = 'nothing';
  }
}
