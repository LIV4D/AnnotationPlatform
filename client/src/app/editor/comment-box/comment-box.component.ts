import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-comment-box',
  templateUrl: './comment-box.component.html',
  styleUrls: ['./comment-box.component.scss']
})
export class CommentBoxComponent implements OnInit {
  panelOpenState = false;
  isDisabled = false;
  up = false;
  down = false;
  moving = false;

  constructor() { }

  ngOnInit(): void {
  }

  onMouseUp(e: Event) {
    console.log('mouse up');
    // e.preventDefault();
    if (this.moving) {
      setTimeout(() => {

        this.isDisabled = false;
        this.down = false;
      }, 100);
    }
  }

  onMouseDown(e: Event) {
    console.log('mouse down');
    this.down = true;
    // this.isDisabled = false;
  }

  onMouseOver(e: Event) {
    console.log('mouse over');
    // this.isDisabled = true;
  }

  onMouseMove(e: Event) {
    console.log('mouse move');
    if (this.down) {
      this.isDisabled = true;
      this.moving = true;
    }
  }
}
