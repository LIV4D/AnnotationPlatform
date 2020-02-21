
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
    // tslint:disable-next-line:max-line-length
    constructor(private http: HttpClient, private headerService: HeaderService, private appService: AppService) {}

    // tslint:disable-next-line:max-line-length
    loadData(tasksComponent: TasksComponent): void {
        console.log('loadData');
        tasksComponent.noData = false;
        tasksComponent.sort.sortChange.subscribe(() => tasksComponent.paginator.pageIndex = 0);
        merge(tasksComponent.sort.sortChange, tasksComponent.paginator.page)
            .pipe(
            startWith({}),
            switchMap(() => {
                this.appService.loading = true;
                // tslint:disable-next-line:max-line-length
                return this.getTasks(tasksComponent.paginator.pageIndex, tasksComponent.pageSize, tasksComponent.showCompleted);
            }),
            catchError(() => {
                this.appService.loading = false;
                return observableOf([]);
            })
            // tslint:disable-next-line:no-shadowed-variable
            ).subscribe((data: ITasks[]) => {
                console.log(data);
                tasksComponent.data = data;
                length = data.length;
                if (length === 0) {
                    tasksComponent.noData = true;
                }
                this.appService.loading = false;
            });
      }

      loadImage(imageId: string): void {
        console.log('loadImage');
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
