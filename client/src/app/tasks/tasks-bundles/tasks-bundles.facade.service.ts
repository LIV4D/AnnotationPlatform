import { TasksBundlesComponent } from './tasks-bundles.component';
import { Injectable, Injector } from '@angular/core';
import { TasksBundlesService } from 'src/app/shared/services/tasksBundles.service';
import { ITasksBundles } from 'src/app/shared/interfaces/ITasksBundles.interface';

@Injectable()
export class TasksBundlesFacadeService {

  constructor(private tasksBundlesService: TasksBundlesService) {  }

  async loadBundles(): Promise<ITasksBundles> {
    return await this.tasksBundlesService.loadBundles();
  }

  async assignBundleTasks(taskIds: number[]): Promise<number> {
    return await this.tasksBundlesService.assignBundleTasks(taskIds);
  }
}
