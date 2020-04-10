import { Injectable, Injector } from '@angular/core';
import { TasksBundlesService } from 'src/app/shared/services/tasks/tasksBundles.service';
import { ITaskBundle } from 'src/app/shared/interfaces/ITaskBundle.interface';

@Injectable()
export class TasksBundlesFacadeService {

  constructor(private tasksBundlesService: TasksBundlesService) {  }

   /**
    * Get task bundles from server
    */
  async loadBundles(): Promise<ITaskBundle[]> {
    return await this.tasksBundlesService.loadBundles();
  }

  /**
   * Assign all tasks in bundle to user
   * @param tasks: all tasks in bundle
   */
  async assignBundleTasks(taskIds: number[]): Promise<number> {
    return await this.tasksBundlesService.assignBundleTasks(taskIds);
  }
}
