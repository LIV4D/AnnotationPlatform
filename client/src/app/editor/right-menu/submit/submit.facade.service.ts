import { Injectable } from '@angular/core';
import { SubmitService } from 'src/app/shared/services/Editor/Data-Persistence/submit.service';
import { AppService } from 'src/app/shared/services/app.service';
import { EditorService } from 'src/app/shared/services/Editor/editor.service';
import { TasksService } from 'src/app/shared/services/Tasks/tasks.service';
import { Task } from 'src/app/shared/models/serverModels/task.model';
import { MatDialogRef } from '@angular/material/dialog';
import { TaskType } from 'src/app/shared/models/serverModels/taskType.model';
import { TaskTypeService } from 'src/app/shared/services/Tasks/taskType.service';

@Injectable({
    providedIn: 'root'
})
export class SubmitFacadeService {
    constructor( private submitService: SubmitService,
                 public appService: AppService,
                 public editorService: EditorService,
                 private tasksService: TasksService,
                 private taskTypeService: TaskTypeService ) {}

    getSaveShortCutToolTipText(): string{
      return this.submitService.getSaveShortCutToolTipText();
    }

    saveLocal():void {
      this.editorService.saveSVGFile();
    }

    async getTasks(imageId: string): Promise<Task[]> {
      return await this.tasksService.getTasksByImageIdApp(imageId);
    }

    async getTaskTypeById(taskTypeId: number): Promise<TaskType> {
      return await this.taskTypeService.getTaskTypeApp(taskTypeId);
    }

    async loadTask(): Promise<void> {
      if (!this.editorService.imageLocal) {
        const currentTask: Task = await this.tasksService.getNextTaskApp();
        await this.submitService.setSubmitedTask(currentTask);
      }
    }

    async loadTaskTypeById(): Promise<void> {
      if (!this.editorService.imageLocal && this.submitService.getSubmitedTask() !== null && this.submitService.getSubmitedTask() !== undefined) {
        const currentTaskType: TaskType = await this.taskTypeService.getTaskTypeApp(this.submitService.getSubmitedTask().taskTypeId);
        await this.submitService.setSubmitedTaskType(currentTaskType);
      }
    }

    getSubmitedTaskType(): TaskType{
      return this.submitService.getSubmitedTaskType();
    }

    getSubmitedTask(): Task{
      return this.submitService.getSubmitedTask();
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
