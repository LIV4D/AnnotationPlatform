import { TasksBundlesComponent } from './tasks-bundles.component';
import { Injectable, Injector } from '@angular/core';
import { TasksBundlesService } from 'src/app/shared/services/tasksBundles.service';
import { ITaskBundle } from 'src/app/shared/interfaces/ITaskBundle.interface';

@Injectable()
export class TasksBundlesFacadeService {

  constructor(private tasksBundlesService: TasksBundlesService) {  }

  async loadBundles(): Promise<ITaskBundle[]> {
    return await this.tasksBundlesService.loadBundles();
  }

  async assignBundleTasks(taskIds: number[]): Promise<number> {
    return await this.tasksBundlesService.assignBundleTasks(taskIds);
  }
}
