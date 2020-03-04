import { Injectable, Injector } from '@angular/core';
import { TasksService } from '../../shared/services/tasks.service';
import { AppService} from '../../shared/services/app.service';

@Injectable()
export class TasksCompletedFacadeService {

  constructor(private taskService: TasksService, public appService: AppService) {  }

  getTasks(page: number, pageSize: number, isCompleted: boolean) {
    return this.taskService.getTasks(page, pageSize, isCompleted);
  }

  hideTask(taskId: number): void {
    this.taskService.hideTask(taskId);
  }
}
