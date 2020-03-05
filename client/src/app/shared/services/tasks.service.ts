
// Components
import { TasksComponent } from './../../tasks/tasks.component';
import { TasksCompletedComponent } from './../../tasks/tasks-completed/tasks-completed.component';
import { TasksToCompleteComponent } from './../../tasks/tasks-to-complete/tasks-to-complete.component';

// Services
import { HeaderService } from './header.service';
import { AppService } from './app.service';

// Interfaces
import { ITasks } from '../interfaces/ITasks.interface';

import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { merge, of as observableOf } from 'rxjs';
import { catchError, startWith, switchMap } from 'rxjs/operators';

// To delete?
import { ITaskList } from '../interfaces/taskList.interface';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { $ } from 'protractor';
import { ITaskGroup } from '../interfaces/taskGroup.interface';
import { TaskType } from '../models/taskType.model';

@Injectable({
    providedIn: 'root'
})

export class TasksService {
  constructor(private http: HttpClient, private headerService: HeaderService, private appService: AppService) {}

  /**
   * Load data
   * Load the Tasks from the server by getting
   */
  loadData(tasksComponent: TasksComponent| TasksToCompleteComponent): void {
      tasksComponent.noData = false;

      // PageIndex set to zero when the user change the sorting
      tasksComponent.sort.sortChange.subscribe(() => tasksComponent.paginator.pageIndex = 0);

      // Observable: Converts sortChange and page Observables into a single Observable
      // The new observable emits all of the items emitted by all of those Observables.
      merge(tasksComponent.sort.sortChange, tasksComponent.paginator.page)
          .pipe(
          // BehaviorSubject: emmiting empty at the begining
          startWith({}),
          // Observable: Switch to a new observable each time the request change
          switchMap(() => {
              this.appService.loading = true; // Enable loading bar
              // getTasks from the server
              return this.getTasks(
                                   tasksComponent.paginator.pageIndex,
                                   tasksComponent.pageSize,
                                   tasksComponent.showCompleted);
          }),
          // Observable: Return an empty observable in the case of an error
          catchError(() => {
              this.appService.loading = false; // Disable loading bar
              return observableOf([]);
          })
          // Observer: Data emited from the server are added on data
          ).subscribe((data: ITasks[]) => {
              // tasksComponent.data = data;
              length = data.length;
              if (length === 0) { tasksComponent.noData = true; }
              this.appService.loading = false;
          });
    }

  /**
   * Loads image: Load an image from the data base
   * @param imageId: id of the task's assignated image
   */
  loadImage(imageId: string): void {
      this.appService.localEditing = false;
      localStorage.setItem('previousPage', 'tasks');
      // this.editorService.loadImageFromServer(imageId);
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

    // this.http.get<ITasks[]>(`/api/tasks/list`).subscribe((response: ITasks[]) => {
    //    console.log(response);
    // });
    return this.headerService.display_progress(req, 'Downloading: Tasks List');
  }

  // tslint:disable-next-line: ban-types
  getNextTask(): Observable<Object> {
    const userId = JSON.parse(localStorage.getItem('currentUser')).user.id;
    return this.http.get(`/api/tasks/${userId}/next`);
  }

  getTaskTypes(taskTypes: TaskType[]) {
    const req = this.http.get<TaskType[]>(`/api/taskTypes/list`, {observe: 'events', reportProgress: true});
    this.headerService.display_progress(req, 'Downloading: Task Types List')
      .subscribe((data: TaskType[]) => taskTypes = data);
  }

  /**
   * Hide a task setting it to not visible
   * @param taskId:
   */
  hideTask(taskId: number) {
    const params = new HttpParams()
                        .set('taskId', taskId ? taskId.toString() : '');
    return this.http.put<ITaskGroup>(`/api/tasks/update/${taskId}`,  { isVisible: false, isComplete: true, params});
  }

  hideTaskApp(taskId: number) {
    this.hideTask(taskId).subscribe();
  }
}
