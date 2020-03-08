import { Injectable, Injector } from '@angular/core';

// Service
import { TasksService } from '../../shared/services/tasks.service';
import { TaskTypeService } from '../../shared/services/Tasks/taskType.service';
import { AppService} from '../../shared/services/app.service';
import { EditorService } from '../../shared/services/Editor/editor.service';
import { UserService } from 'src/app/shared/services/user.service';

@Injectable()
export class TasksToCompleteFacadeService {

  constructor(private taskService: TasksService,
              private taskTypeService: TaskTypeService,
              private userService: UserService,
              private editorService: EditorService,
              public appService: AppService) {  }

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
    this.editorService.loadImageFromServer(imageId);
  }
}
