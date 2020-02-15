import { Injectable, Injector } from '@angular/core';
import { AppService } from '../shared/services/app.service';
import { TasksService } from '../shared/services/tasks.service';
import { Observable } from 'rxjs';

@Injectable()
export class TaskFacadeService {

  constructor(private appService: AppService, private taskService: TasksService) {  }



}
