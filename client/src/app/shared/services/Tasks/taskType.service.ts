// Services
import { HeaderService } from './../header.service';

// Model
import { TaskType } from '../../models/serverModels/taskType.model';

import { HttpClient, HttpParams} from '@angular/common/http';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})

// The service provides usefull function helping with the Task Types
export class TaskTypeService {
  constructor(private http: HttpClient, private headerService: HeaderService) {}


  /**
   * Gets a task type with the taskType id
   * @param taskTypeId
   * @returns task type
   */
  getTaskType(taskTypeId: number): Observable<TaskType>{
    const req = this.http.get<TaskType>(`/api/taskTypes/get/${taskTypeId}`, {observe: 'events', reportProgress: true});
    return this.headerService.display_progress(req, 'Downloading: Task Types');
  }

  async getTaskTypeApp(taskTypeId: number) {
    const data = await this.getTaskType(taskTypeId).toPromise();
    return data as TaskType;
  }

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
