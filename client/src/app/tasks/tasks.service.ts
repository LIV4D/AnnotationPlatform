import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { ITaskGallery } from '../../../../common/common_interfaces/interfaces';
import { HeaderService } from '../header/header.service';

@Injectable({
    providedIn: 'root'
})
export class TasksService {
    constructor(private http: HttpClient, private headerService: HeaderService) {}

    getTasks(page: number, pageSize: number, completed: boolean): Observable<ITaskGallery[]> {
        const params = new HttpParams()
                            .set('page', page ? page.toString() : '0')
                            .set('pageSize', pageSize ? pageSize.toString() : '25')
                            .set('isComplete', completed ? 'true' : 'false');
        const userId = JSON.parse(localStorage.getItem('currentUser')).user.id;
        const req = this.http.get<ITaskGallery[]>(`/api/tasks/gallery/${userId}`,
                                {params: params, observe: 'events', reportProgress: true});
        return this.headerService.display_progress(req, 'Downloading: Tasks List');
    }

    getNextTask(): Observable<Object> {
        const userId = JSON.parse(localStorage.getItem('currentUser')).user.id;
        return this.http.get(`/api/tasks/${userId}/next`);
    }
}
