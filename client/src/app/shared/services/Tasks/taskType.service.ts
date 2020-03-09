// Services
import { HeaderService } from './../header.service';

// Model
import { TaskType } from '../../models/taskType.model';

import { HttpClient} from '@angular/common/http';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})

export class TaskTypeService {
  constructor(private http: HttpClient, private headerService: HeaderService) {}

  /**
   * Gets list of task types from the server
   * @returns task types
   */
  getTaskTypes(): Observable<TaskType[]> {
    const req = this.http.get<TaskType[]>(`/api/taskTypes/list`, {observe: 'events', reportProgress: true});
    return this.headerService.display_progress(req, 'Downloading: Task Types List');
  }

  async getTaskTypesApp() {
    const data = await this.getTaskTypes().toPromise();
    return data as TaskType[];
  }

  /**
   * Configures the task filter the filter for being able to match with the taskTypeId
   * @returns filterPredicate
   */
  configureFilterPredicate() {
  return (data, filter: string): boolean => {
    return data.taskTypeId.toString().toLowerCase().includes(filter);
    };
  }
}
