import { Injectable, Injector } from '@angular/core';
import { TasksService } from '../../shared/services/tasks.service';
import { TaskTypeService } from '../../shared/services/Tasks/taskType.service';
import { AppService} from '../../shared/services/app.service';
import { EditorService } from '../../shared/services/Editor/editor.service';

@Injectable()
export class TasksCompletedFacadeService {

  constructor(private taskService: TasksService,
              private taskTypeService: TaskTypeService,
              private editorService: EditorService,
              public appService: AppService) {}

  getTasks(page: number, pageSize: number, isCompleted: boolean) {
    return this.taskService.getTasks(page, pageSize, isCompleted);
  }

  async getTaskTypes() {
    return await this.taskTypeService.getTaskTypesApp();
  }

  ArchiveTaskApp(taskId: number): void {
    this.taskService.ArchiveTaskApp(taskId);
  }

  isAllSelected(selectionLength: number, dataLength: number){
    return this.taskService.isAllSelected(selectionLength, dataLength);
  }

  loadImageFromServer(imageId: string) {
    this.editorService.loadImageFromServer(imageId);
  }
}
