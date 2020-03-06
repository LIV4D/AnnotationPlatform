import { Injectable, Injector } from '@angular/core';
import { TasksService } from '../../shared/services/tasks.service';
import { AppService} from '../../shared/services/app.service';

import { TaskType } from 'src/app/shared/models/taskType.model';

@Injectable()
export class TasksCompletedFacadeService {

  constructor(private taskService: TasksService, public appService: AppService) {  }

  getTasks(page: number, pageSize: number, isCompleted: boolean) {
    return this.taskService.getTasks(page, pageSize, isCompleted);
  }

  getTaskTypes(taskTypes: TaskType[]) {
    this.taskService.getTaskTypes();
  }

  hideTaskApp(taskId: number): void {
    this.taskService.hideTaskApp(taskId);
  }
}
