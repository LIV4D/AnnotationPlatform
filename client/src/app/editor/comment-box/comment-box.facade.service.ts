import { Injectable } from '@angular/core';
import { CommentBoxService } from 'src/app/shared/services/Editor/comment-box.service';
import { ToolboxService } from 'src/app/shared/services/Editor/toolbox.service';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CommentBoxFacadeService {

  constructor(private toolBoxService: ToolboxService) { }

  get commentBoxTool (): Subject<boolean> {
    return (this.toolBoxService.listOfTools[6] as CommentBoxService).commentBoxCheckBoxClicked;
  }
}
