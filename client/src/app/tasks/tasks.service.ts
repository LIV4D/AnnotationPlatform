import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { ITaskList } from '../model/common/interfaces/taskList.interface';

@Injectable({
    providedIn: 'root'
})
export class TasksService {
    constructor(private http: HttpClient) {}
    getTasks(page: number, pageSize: number, completed: boolean): Observable<ITaskList> {
        const options = {
            params: new HttpParams()
                .set('page', page ? page.toString() : '0')
                .set('pageSize', pageSize ? pageSize.toString() : '25')
                .set('completed', completed ? 'true' : 'false')
        };
        const userId = JSON.parse(localStorage.getItem('currentUser')).user.id;
        const res = this.http.get<ITaskList>(`/api/taskList/${userId}`, options);
        return res;
    }
}
