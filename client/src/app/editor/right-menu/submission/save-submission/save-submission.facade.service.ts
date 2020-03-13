import { Injectable } from '@angular/core';
import { SaveSubmissionService } from 'src/app/shared/services/Editor/save-submission.service';
import { AppService } from 'src/app/shared/services/app.service';

@Injectable({
    providedIn: 'root'
})
export class SaveSubmissionFacadeService {
    constructor( private saveSubmissionService: SaveSubmissionService,
                 public appService: AppService ) {}

    getSaveShortCutToolTipText(){
      return this.saveSubmissionService.getSaveShortCutToolTipText();
    }
}
