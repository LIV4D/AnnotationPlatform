import { TasksComponent } from './tasks.component';
import { Injectable, Injector } from '@angular/core';
// { AppService } from '../shared/services/app.service';
import { TasksService } from '../shared/services/tasks.service';
import { Observable } from 'rxjs';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';

@Injectable()
export class TaskFacadeService {

  constructor(private taskService: TasksService) {  }

  // tslint:disable-next-line:max-line-length
  loadData(tasksComponent: TasksComponent): void {
    //this.taskService.loadData(tasksComponent);

  }

  loadImage(imageId: string): void {
    this.taskService.loadImage(imageId);
  }
}



