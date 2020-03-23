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
  pointFormat = 'example-box2';

  constructor() { }

  ngOnInit(): void {
  }

  onMouseUp(e: Event) {
    console.log('commentBox -- mouse up');
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
    console.log('commentBox -- mouse down');
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
  }

  onFormClick(e: Event) {
    console.log('commentBox -- textarea clicked');
    this.pointFormat = 'nothing';
  }
}



// import { Component, OnInit } from '@angular/core';
// import { MaterialModule } from './../../../material/material.module';
// import { CommentBoxFacadeService } from './comment-box.facade.service';

// @Component({
//   selector: 'app-comment-box',
//   templateUrl: './comment-box.component.html',
//   styleUrls: ['./comment-box.component.scss']
// })
// export class CommentBoxComponent implements OnInit {

//   constructor(private commentBoxFacadeService: CommentBoxFacadeService) { }

//   ngOnInit(): void {
//   }

//   addComment(){
//     console.log('Add comment')
//     this.hideCommentBox();
//   }

//   cancel(){
//     console.log('cancel')
//     this.hideCommentBox();
//   }

//   hideCommentBox(){
//     this.commentBoxFacadeService.hideCommentBox();
//   }

// }



