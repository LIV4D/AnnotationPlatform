import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CommentBoxService {

  commentBoxCheckBoxClicked: Subject<boolean>;

  constructor() {
    this.commentBoxCheckBoxClicked = new Subject<any>();
  }

  sendStateCommentBox(checkBoxCommentBox: boolean) {
    this.commentBoxCheckBoxClicked.next(checkBoxCommentBox);
  }
}
