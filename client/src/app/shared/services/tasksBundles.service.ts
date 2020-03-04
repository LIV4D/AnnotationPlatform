import { TasksBundlesComponent } from './../../tasks/tasks-bundles/tasks-bundles.component';
import { ITaskGallery } from './../../../../../server/app/interfaces/gallery.interface';
import { HeaderService } from './header.service';
import { AppService } from './app.service';
import { HttpClient, HttpParams, HttpEvent } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ITasksBundles } from '../interfaces/ITasksBundles.interface';


@Injectable()
export class TasksBundlesService {

  constructor(private http: HttpClient, private headerService: HeaderService, private appService: AppService) {}

  loadBundles(tasksBundlesComponent: TasksBundlesComponent) {
    this.getBundles().subscribe((data: ITasksBundles) => {
      tasksBundlesComponent.bundles = data;
      if (length === 0) { tasksBundlesComponent.noData = true; }
    });

  }

  getBundles(): Observable<ITasksBundles> {
    const params = new HttpParams()
                        .set('userId', JSON.parse(localStorage.getItem('currentUser')).user.id);
    return this.http.get<ITasksBundles>('/api/taskPrioritys/get/tasksBundles', { params });
  }

}
