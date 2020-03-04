import { Injectable, Injector } from '@angular/core';
import { TasksToCompleteComponent } from './tasks-to-complete.component';
import { TasksService } from '../../shared/services/tasks.service';

@Injectable()
export class TasksToCompleteFacadeService {

  constructor(private taskService: TasksService) {  }

  // tslint:disable-next-line:max-line-length
  loadCompletedTasksData(tasksToCompleteComponent: TasksToCompleteComponent): void {
    this.taskService.loadData(tasksToCompleteComponent);
  }
}
