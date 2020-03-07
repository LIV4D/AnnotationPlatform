// Services
import { HeaderService } from './../header.service';

// Model
import { TaskType } from '../../models/taskType.model';

import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})

export class TaskTypeService {
  constructor(private http: HttpClient, private headerService: HeaderService) {}

  getTaskTypes(): Observable<object> {
    const req = this.http.get<TaskType[]>(`/api/taskTypes/list`, {observe: 'events', reportProgress: true});
    return this.headerService.display_progress(req, 'Downloading: Task Types List');
  }

  async getTaskTypesApp() {
    const data = await this.getTaskTypes().toPromise();
    return data as TaskType[];
  }
}
