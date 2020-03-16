// Services
import { HeaderService } from './../header.service';
import { AppService } from './../app.service';

// Interface
import { ITaskGroup } from '../../interfaces/taskGroup.interface';

import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { Task } from '../../models/serverModels/task.model';

@Injectable({
    providedIn: 'root'
})

export class TasksService {
  constructor(private http: HttpClient, private headerService: HeaderService, private appService: AppService) {}

  /**
   * Loads image: Load an image from the data base
   * @param imageId: id of the task's assignated image
   */
  loadImage(imageId: string): void {
      this.appService.localEditing = false;
      localStorage.setItem('previousPage', 'tasks');
  }

  /**
   * Gets the list of tasks attributed for the current logged user
   * @param page: page index of a page
   * @param pageSize: number of page index in one page
   * @param isCompleted: a task can be complited or uncompleted
   * @returns Observable<ITaskGroup>
   */
  getTasks(page: number, pageSize: number, isCompleted: boolean): Observable<ITaskGroup> {
    const params = new HttpParams()
                        .set('page', page ? page.toString() : '0')
                        .set('pageSize', pageSize ? pageSize.toString() : '25')
                        .set('isCompleted', isCompleted ? 'true' : 'false');
    const userId = JSON.parse(localStorage.getItem('currentUser')).user.id;

    const req = this.http.get<ITaskGroup>(`/api/tasks/gallery/${userId}`, {params, observe: 'events', reportProgress: true});
    return this.headerService.display_progress(req, 'Downloading: Tasks List');
  }

  getTasksByImageId(imageId:string, displayProgress= false):Observable<Task[]> {
    const userId = JSON.parse(localStorage.getItem('currentUser')).user.id;
    const params = new HttpParams()
                            .set('userId', userId ? userId : '' )
                            .set('imageId', imageId ? imageId : '');
    if (displayProgress) {
      const req = this.http.get<Task[]>(`/api/tasks/list`, {params,  observe: 'events', reportProgress: true});
      return this.headerService.display_progress(req, 'Downloading: Tasks List');
    } else {
      return this.http.get<Task[]>(`/api/tasks/list`, {params});
    }
  }

  async getTasksByImageIdApp(imageId:string, displayProgress= false): Promise<Task[]>{
    const tasks = await this.getTasksByImageId(imageId, displayProgress).toPromise();
    return tasks as Task[];
  }

  // tslint:disable-next-line: ban-types
  getNextTask(): Observable<Object> {
      const userId = JSON.parse(localStorage.getItem('currentUser')).user.id;
      return this.http.get(`/api/tasks/get/next/${userId}`);
  }

  /**
   * Archive a task setting it to not visible
   * @param taskId: taskType founded with the taskId
   */
  ArchiveTask(taskId: number): Observable<ITaskGroup> {
    const params = new HttpParams()
                        .set('taskId', taskId ? taskId.toString() : '');
    return this.http.put<ITaskGroup>(`/api/tasks/update/${taskId}`,  { isVisible: false, isComplete: true, params});
  }

  archiveTaskApp(taskId: number) {
    this.ArchiveTask(taskId).subscribe();
  }

  /**
   * Determines whether all selected is
   * @param selectionLength: length of the data selection
   * @param dataLength: length of all the datas
   * @returns boolean
   */
  isAllSelected(selectionLength: number, dataLength: number) {
    return selectionLength === dataLength;
  }
}
