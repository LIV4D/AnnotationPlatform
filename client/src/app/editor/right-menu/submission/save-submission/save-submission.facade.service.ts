import { Injectable } from '@angular/core';
import { SaveSubmissionService } from 'src/app/shared/services/Editor/save-submission.service';
import { AppService } from 'src/app/shared/services/app.service';
import { EditorService } from 'src/app/shared/services/Editor/editor.service'
import { TasksService } from 'src/app/shared/services/tasks.service'
import { ITaskGroup } from 'src/app/shared/interfaces/taskGroup.interface';
import { Task } from 'src/app/shared/models/task.model';

@Injectable({
    providedIn: 'root'
})
export class SaveSubmissionFacadeService {
    constructor( private saveSubmissionService: SaveSubmissionService,
                 public appService: AppService,
                 public editorService: EditorService,
                 private tasksService: TasksService ) {}

    getSaveShortCutToolTipText(): string{
      return this.saveSubmissionService.getSaveShortCutToolTipText();
    }

    saveLocal():void {
      this.editorService.saveSVGFile();
    }

    async getTasks(imageId: string): Promise<Task[]> {
      return await this.tasksService.getTasksByImageIdApp(imageId);
    }

}
