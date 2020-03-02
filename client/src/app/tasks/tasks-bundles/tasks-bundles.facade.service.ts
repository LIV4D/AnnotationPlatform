import { Injectable, Injector } from '@angular/core';
import { TasksBundlesService } from 'src/app/shared/services/tasksBundles.service';

@Injectable()
export class TasksBundlesFacadeService {

  constructor(private tasksBundlesService: TasksBundlesService) {  }

  loadData(): void {
    this.tasksBundlesService.loadData();
  }
}
