
import { TasksComponent } from './../../tasks/tasks.component';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { ITaskList } from '../interfaces/taskList.interface';
import { HeaderService } from './header.service';
import { merge, of as observableOf } from 'rxjs';
import { catchError, startWith, switchMap } from 'rxjs/operators';
import { AppService } from './app.service';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { $ } from 'protractor';
import { ITasks } from '../interfaces/ITasks.interface';


@Injectable({
    providedIn: 'root'
})

export class TasksService {
    constructor(private http: HttpClient, private headerService: HeaderService, private appService: AppService) {}

    /**
     * Load data
     * Load the Tasks from the server by getting
     */
    loadData(tasksComponent: TasksComponent): void {
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
                return this.getTasks(tasksComponent.paginator.pageIndex,
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
                tasksComponent.data = data;
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


    getTasks(page: number, pageSize: number, completed: boolean): Observable<ITasks[]> {
        const params = new HttpParams()
                            .set('page', page ? page.toString() : '0')
                            .set('pageSize', pageSize ? pageSize.toString() : '25')
                            .set('completed', completed ? 'true' : 'false');
        const userId = JSON.parse(localStorage.getItem('currentUser')).user.id;
        // tslint:disable-next-line:object-literal-shorthand
        // const req = this.http.get<ITaskList>(`//api/tasks/list/${userId}`, {params: params, observe: 'events', reportProgress: true});
        const req = this.http.get<ITasks[]>(`/api/tasks/list`, {observe: 'events', reportProgress: true});

        // this.http.get<ITasks[]>(`/api/tasks/list`).subscribe((response: ITasks[]) => {
        //    console.log(response);
        // });
        return this.headerService.display_progress(req, 'Downloading: Tasks List');
    }

    // tslint:disable-next-line:ban-types
    getNextTask(): Observable<Object> {
        const userId = JSON.parse(localStorage.getItem('currentUser')).user.id;
        return this.http.get(`/api/tasks/${userId}/next`);
    }
}
