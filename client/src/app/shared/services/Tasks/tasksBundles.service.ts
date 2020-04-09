import { HeaderService } from './../header.service';
import { AppService } from './../app.service';
import { HttpClient, HttpParams, HttpEvent, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ITaskBundle } from '../../interfaces/ITaskBundle.interface';

/**
 * Get bundles from server and assign them to user on demand
 */
@Injectable()
export class TasksBundlesService {
  private status = 0;

  constructor(private http: HttpClient, private headerService: HeaderService, private appService: AppService) {}

  /**
   * Get bundles from server
   */
  async loadBundles(): Promise<ITaskBundle[]> {
    const data = await this.getBundlesObservable().toPromise();
    return data;
  }

  /**
   * Add user id as a param to http get request
   */
  getBundlesObservable(): Observable<ITaskBundle[]> {
    const params = new HttpParams()
                        .set('userId', JSON.parse(localStorage.getItem('currentUser')).user.id);
    return this.http.get<ITaskBundle[]>('/api/taskPrioritys/get/tasksBundles', { params });
  }

  /**
   * Assign array of tasks to user
   * @param taskIds : Array of tak IDs to be assigned to user
   */
  async assignBundleTasks(taskIds: number[]): Promise<number> {
    const response = await this.getAssignObservable(taskIds).toPromise();

    return response.status;
  }

  /**
   * http put request to assign task IDs to user
   * @param taskIds : Array of tak IDs to be assigned to user
   */
  getAssignObservable(taskIds: number[]): Observable<HttpResponse<object>> {
    return this.http.put('/api/taskPrioritys/assign', { ids : taskIds }, {observe : 'response'});
  }

}
