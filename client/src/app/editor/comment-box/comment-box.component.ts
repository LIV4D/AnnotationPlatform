import {
  Component,
  OnInit,
  OnChanges,
  SimpleChanges,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';

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
  // @ViewChild('textArea', {read: ViewContainerRef}) textArea: ViewContainerRef;
  textAreaValue: string;

  constructor() {}

  ngOnInit(): void {
    this.textAreaValue = 'This is a test';
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log('Event Changes' + changes);
    // console.log(this.textArea.element.nativeElement);
  }

  onMouseUp(e: Event) {
    // console.log('commentBox -- mouse up');
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
    // console.log('commentBox -- mouse down');
    this.down = true;
    this.pointFormat = 'nothing';
    // this.isDisabled = false;
  }

  onMouseMove(e: Event) {
    // console.log('commentBox -- mouse move');
    if (this.down) {
      this.isDisabled = true;
      this.moving = true;
    }
  }

  onFormClick(e: Event) {
    // console.log('commentBox -- textarea clicked');
    this.pointFormat = 'nothing';
  }
}
