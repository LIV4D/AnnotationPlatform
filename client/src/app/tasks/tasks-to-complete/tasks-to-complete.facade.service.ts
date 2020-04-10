import { Injectable, Injector } from '@angular/core';

// Service
import { TasksService } from '../../shared/services/tasks/tasks.service';
import { TaskTypeService } from '../../shared/services/Tasks/taskType.service';
import { AppService} from '../../shared/services/app.service';
import { LoadingService } from '../../shared/services/Editor/Data-Persistence/loading.service';
import { UserService } from 'src/app/shared/services/user.service';
import { SubmitService } from 'src/app/shared/services/Editor/Data-Persistence/submit.service';
import { Task } from 'src/app/shared/models/serverModels/task.model';

@Injectable()
export class TasksToCompleteFacadeService {

  constructor(private taskService: TasksService,
              private taskTypeService: TaskTypeService,
              private userService: UserService,
              private loadingService: LoadingService,
              private submitService: SubmitService,
              public appService: AppService) {}

  configureFilterPredicate() {
    return this.taskTypeService.configureFilterPredicate();
  }

  getTasks(page: number, pageSize: number, isCompleted: boolean) {
    return this.taskService.getTasks(page, pageSize, isCompleted);
  }

  async getTaskTypes() {
    return await this.taskTypeService.getTaskTypesApp();
  }

  async getUsers() {
    return await this.userService.getUsersApp();
  }

  loadImageFromServer(imageId: string) {
    this.loadingService.loadImageFromServer(imageId);
  }

  setCurrentTask(task: Task) {
    this.submitService.setSubmitedTask(task);
  }
}
