import { Injectable, Injector } from '@angular/core';
import { TasksService } from '../../shared/services/tasks.service';

@Injectable()
export class TasksBundlesFacadeService {

  constructor(private taskService: TasksService) {  }
}
