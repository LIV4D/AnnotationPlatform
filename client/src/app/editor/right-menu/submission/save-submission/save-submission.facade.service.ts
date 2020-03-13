import { Injectable } from '@angular/core';
import { SaveSubmissionService } from 'src/app/shared/services/Editor/save-submission.service';
import { AppService } from 'src/app/shared/services/app.service';
import { EditorService } from 'src/app/shared/services/Editor/editor.service'

@Injectable({
    providedIn: 'root'
})
export class SaveSubmissionFacadeService {
    constructor( private saveSubmissionService: SaveSubmissionService,
                 public appService: AppService,
                 private editorService: EditorService ) {}

    getSaveShortCutToolTipText(): string{
      return this.saveSubmissionService.getSaveShortCutToolTipText();
    }

    saveLocal():void {
      this.editorService.saveSVGFile();
    }

}
