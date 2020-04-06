import { Injectable } from '@angular/core';
import { SubmitService } from 'src/app/shared/services/Editor/submit.service';
import { AppService } from 'src/app/shared/services/app.service';
import { EditorService } from 'src/app/shared/services/Editor/editor.service';
import { TasksService } from 'src/app/shared/services/tasks/tasks.service';
import { Task } from 'src/app/shared/models/serverModels/task.model';
import { MatDialogRef } from '@angular/material/dialog';

@Injectable({
    providedIn: 'root'
})
export class SubmitFacadeService {
    constructor( private submitService: SubmitService,
                 public appService: AppService,
                 public editorService: EditorService,
                 private tasksService: TasksService ) {}

    getSaveShortCutToolTipText(): string{
      return this.submitService.getSaveShortCutToolTipText();
    }

    saveLocal():void {
      this.editorService.saveSVGFile();
    }

    async getTasks(imageId: string): Promise<Task[]> {
      return await this.tasksService.getTasksByImageIdApp(imageId);
    }

    async loadTask(): Promise<void> {
      if (!this.editorService.imageLocal) {
        const currentTask: Task = await this.tasksService.getNextTaskApp();
        await this.submitService.setCurrentTask(currentTask);
      }
    }

    getCurrentTask(): Task{
      return this.submitService.getCurrentTask();
    }

    completeTask(tasks: Task): void{
      this.tasksService.completeTask(tasks);
    }

    afterClosedTaskDialog(dialogRef: MatDialogRef<any, any>) {
      this.submitService.afterClosedTaskDialog(dialogRef);
    }

    saveAnnotation(loadNextHasBeenSelected= false): void {
      this.submitService.saveAnnotation(loadNextHasBeenSelected);
    }
}
