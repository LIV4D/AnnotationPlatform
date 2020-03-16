import { Injectable } from '@angular/core';
import { EditorService } from 'src/app/shared/services/Editor/editor.service';
import { SubmitService } from 'src/app/shared/services/Editor/submit.service';

@Injectable({
    providedIn: 'root'
})
export class TaskDialogSubmissionFacadeService {

    constructor(private submitService: SubmitService,
                public editorService: EditorService) {}

  // Function called upon clicking confirm in Task dialog
  // Updates all tasks with new completed value
  updateTasks(tasks: any[]): void {
    this.submitService.updateTasks(tasks);
  }
}
