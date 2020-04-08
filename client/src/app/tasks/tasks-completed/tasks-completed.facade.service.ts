import { Injectable, Injector } from '@angular/core';
import { TasksService } from '../../shared/services/tasks/tasks.service';
import { TaskTypeService } from '../../shared/services/Tasks/taskType.service';
import { AppService} from '../../shared/services/app.service';
import { LoadingService } from '../../shared/services/Editor/Data-Persistence/loading.service';
import { SubmitService } from 'src/app/shared/services/Editor/Data-Persistence/submit.service';
import { Task } from 'src/app/shared/models/serverModels/task.model';

@Injectable()
export class TasksCompletedFacadeService {

  constructor(private taskService: TasksService,
              private taskTypeService: TaskTypeService,
              private loadingService: LoadingService,
              private submitService: SubmitService,
              public appService: AppService) {}

  getTasks(page: number, pageSize: number, isCompleted: boolean) {
    return this.taskService.getTasks(page, pageSize, isCompleted);
  }

  async getTaskTypes() {
    return await this.taskTypeService.getTaskTypesApp();
  }

  archiveTaskApp(taskId: number): void {
    this.taskService.archiveTaskApp(taskId);
  }

  isAllSelected(selectionLength: number, dataLength: number){
    return this.taskService.isAllSelected(selectionLength, dataLength);
  }

  loadImageFromServer(imageId: string) {
    this.loadingService.loadImageFromServer(imageId);
  }

  setCurrentTask(task: Task) {
    this.submitService.setSubmitedTask(task);
  }
}
