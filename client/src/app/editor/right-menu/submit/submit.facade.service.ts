import { Injectable } from '@angular/core';
import { SubmitService } from 'src/app/shared/services/Editor/Data-Persistence/submit.service';
import { AppService } from 'src/app/shared/services/app.service';
import { TasksService } from 'src/app/shared/services/Tasks/tasks.service';
import { Task } from 'src/app/shared/models/serverModels/task.model';
import { MatDialogRef } from '@angular/material/dialog';
import { TaskType } from 'src/app/shared/models/serverModels/taskType.model';
import { TaskTypeService } from 'src/app/shared/services/Tasks/taskType.service';
import { LoadingService } from 'src/app/shared/services/Editor/Data-Persistence/loading.service';

@Injectable({
    providedIn: 'root'
})
export class SubmitFacadeService {
    constructor( private submitService: SubmitService,
                 public appService: AppService,
                 private tasksService: TasksService,
                 private loadingService: LoadingService,
                 private taskTypeService: TaskTypeService ) {}

    getSaveShortCutToolTipText(): string{
      return this.submitService.getSaveShortCutToolTipText();
    }

    saveLocal():void {
      this.submitService.saveSVGFile();
    }

    async getTasks(imageId: string): Promise<Task[]> {
      return await this.tasksService.getTasksByImageIdApp(imageId);
    }

    async getTaskTypeById(taskTypeId: number): Promise<TaskType> {
      return await this.taskTypeService.getTaskTypeApp(taskTypeId);
    }

    async loadTask(): Promise<void> {
      if (!this.loadingService.getImageLocal()) {
        const currentTask: Task = await this.tasksService.getNextTaskApp();
        await this.loadingService.setTaskLoaded(currentTask);
      }
    }

    async loadTaskTypeById():Promise<void> {
      if (!this.loadingService.getImageLocal() && this.loadingService.getTaskLoaded() !== null && this.loadingService.getTaskLoaded() !== undefined) {
        const currentTaskType: TaskType = await this.taskTypeService.getTaskTypeApp(this.loadingService.getTaskLoaded().taskTypeId);
        await this.loadingService.setTaskTypeLoaded(currentTaskType);
      }
    }

    public getLoadedTaskType():TaskType {
      return this.loadingService.getTaskTypeLoaded();
    }

    public getLoadedTask():Task{
      return this.loadingService.getTaskLoaded();
    }

    public hasTaskLoaded():boolean {
      return ( this.getLoadedTask() !== undefined && this.getLoadedTask() !== null);
    }

    public completeTask(tasks: Task): void{
      this.tasksService.completeTask(tasks);
    }

    afterClosedTaskDialog(dialogRef: MatDialogRef<any, any>) {
      this.submitService.afterClosedTaskDialog(dialogRef);
    }

    saveAnnotation(loadNextHasBeenSelected= false): void {
      this.submitService.saveAnnotation(loadNextHasBeenSelected);
    }
}
