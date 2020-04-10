import { Injectable } from '@angular/core';
import { EditorService } from 'src/app/shared/services/Editor/editor.service';

@Injectable({
  providedIn: 'root'
})
export class CommentBoxFacadeService {

  constructor(private editorService: EditorService) { }

  hideCommentBox() {
    // this.editorService.commentBoxVisible = false;
  }
}
