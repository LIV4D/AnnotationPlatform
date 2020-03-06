import { Injectable, Injector } from '@angular/core';

// Service
import { TasksService } from '../../shared/services/tasks.service';
import { AppService} from '../../shared/services/app.service';

/// Model
import { TaskType } from 'src/app/shared/models/taskType.model';

@Injectable()
export class TasksToCompleteFacadeService {

  constructor(private taskService: TasksService, public appService: AppService) {  }

  getTasks(page: number, pageSize: number, isCompleted: boolean) {
    return this.taskService.getTasks(page, pageSize, isCompleted);
  }

  async getTaskTypes() {
    return await this.taskService.getTaskTypesApp();
  }
}
