import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CommentBoxService {

  private isCommentModeActive: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  constructor() {
  }

  public setIsCommentModeActive(isActive: boolean): void{
      this.isCommentModeActive.next(isActive);
  }
  
  public getIsCommentModeActivess(): Observable<Boolean> {
      return this.isCommentModeActive.asObservable();
  }    
}
