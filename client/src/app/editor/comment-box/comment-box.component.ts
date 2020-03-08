import { Component, OnInit } from '@angular/core';
import { MaterialModule } from './../../../material/material.module';
import { CommentBoxFacadeService } from './comment-box.facade.service';

@Component({
  selector: 'app-comment-box',
  templateUrl: './comment-box.component.html',
  styleUrls: ['./comment-box.component.scss']
})
export class CommentBoxComponent implements OnInit {

  constructor(private commentBoxFacadeService: CommentBoxFacadeService) { }

  ngOnInit(): void {
  }

  addComment(){
    console.log('Add comment')
    this.hideCommentBox();
  }

  cancel(){
    console.log('cancel')
    this.hideCommentBox();
  }

  hideCommentBox(){
    this.commentBoxFacadeService.hideCommentBox();
  }

}
