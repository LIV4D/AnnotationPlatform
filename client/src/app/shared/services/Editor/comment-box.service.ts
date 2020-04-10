import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
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

  public setIsCommentModeActive(isActive: boolean): void{
    this.isCommentModeActive.next(isActive);
  }

  public getIsCommentModeActives(): Observable<Boolean> {
      return this.isCommentModeActive.asObservable();
  }  
}
