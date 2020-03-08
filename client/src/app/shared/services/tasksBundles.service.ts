import { TasksBundlesComponent } from './../../tasks/tasks-bundles/tasks-bundles.component';
import { ITaskGallery } from './../../../../../server/app/interfaces/gallery.interface';
import { HeaderService } from './header.service';
import { AppService } from './app.service';
import { HttpClient, HttpParams, HttpEvent, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ITasksBundles } from '../interfaces/ITasksBundles.interface';


@Injectable()
export class TasksBundlesService {
  private status = 0;

  constructor(private http: HttpClient, private headerService: HeaderService, private appService: AppService) {}

  async loadBundles(): Promise<ITasksBundles> {
    const data = await this.getBundlesObservable().toPromise();
    return data;
    // await this.getBundlesObservable().subscribe((data: ITasksBundles) => {
    //   tasksBundlesComponent.bundles = data;
    //   if (length === 0) { tasksBundlesComponent.noData = true; }
    // });

  }

  getBundlesObservable(): Observable<ITasksBundles> {
    const params = new HttpParams()
                        .set('userId', JSON.parse(localStorage.getItem('currentUser')).user.id);
    return this.http.get<ITasksBundles>('/api/taskPrioritys/get/tasksBundles', { params });
  }

  async assignBundleTasks(taskIds: number[]): Promise<number> {
    const response = await this.getAssignObservable(taskIds).toPromise();

    return response.status;
  }

  getAssignObservable(taskIds: number[]): Observable<HttpResponse<object>> {
    return this.http.put('/api/taskPrioritys/assign', { ids : taskIds }, {observe : 'response'});
  }

}
