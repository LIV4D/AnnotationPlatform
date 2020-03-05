import { TasksBundlesComponent } from './tasks-bundles.component';
import { Injectable, Injector } from '@angular/core';
import { TasksBundlesService } from 'src/app/shared/services/tasksBundles.service';

@Injectable()
export class TasksBundlesFacadeService {

  constructor(private tasksBundlesService: TasksBundlesService) {  }

  loadBundles(tasksBundlesComponent: TasksBundlesComponent): void {
    this.tasksBundlesService.loadBundles(tasksBundlesComponent);
  }

  assignBundleTasks(taskIds: number[]) {
    this.tasksBundlesService.assignBundleTasks(taskIds);
  }
}
