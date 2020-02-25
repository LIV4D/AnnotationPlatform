import { Injectable, Injector } from '@angular/core';
import { TasksCompletedComponent } from './tasks-completed.component';
import { TasksService } from '../../shared/services/tasks.service';

@Injectable()
export class TasksCompletedFacadeService {

  constructor(private taskService: TasksService) {  }

  // tslint:disable-next-line:max-line-length
  loadCompletedTasksData(tasksCompletedComponent: TasksCompletedComponent): void {
    this.taskService.loadCompletedTasksData(tasksCompletedComponent);
  }
}
