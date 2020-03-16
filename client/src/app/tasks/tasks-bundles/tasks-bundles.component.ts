import { Component, OnInit } from '@angular/core';
import { TasksBundlesFacadeService } from './tasks-bundles.facade.service';
import { ITasks } from 'src/app/shared/interfaces/ITasks.interface';
import { isNullOrUndefined } from 'util';
import { ITaskBundle } from 'src/app/shared/interfaces/ITaskBundle.interface';

@Component({
  selector: 'app-tasks-bundles',
  templateUrl: './tasks-bundles.component.html',
  styleUrls: ['./tasks-bundles.component.scss']
})
export class TasksBundlesComponent implements OnInit {

  bundles: ITaskBundle[] = [
    { bundle: [], taskType: 'Task type', taskTypeDescription: 'Description', bundleThumbnails: [''], },
    { bundle: [], taskType: 'Task type', taskTypeDescription: 'Description', bundleThumbnails: [''], },
    { bundle: [], taskType: 'Task type', taskTypeDescription: 'Description', bundleThumbnails: [''], }
  ];

  isBundleAssigned = false;
  noData: boolean;

  constructor(private facadeService: TasksBundlesFacadeService) {
  }

  ngOnInit(): void {
    this.loadBundles();
  }

  async loadBundles() {
    this.bundles = await this.facadeService.loadBundles();
    console.log(this.bundles);
  }

  areBundlesEmpty() {
    return isNullOrUndefined(this.bundles.length === 0);
  }

  async assignBundleTasks(tasks: ITasks[]) {
    const taskIds = [];
    tasks.forEach(task => {
      taskIds.push(task.id);
    });
    const res = await this.facadeService.assignBundleTasks(taskIds);

    // check server response
    if (res === 204) {
      this.isBundleAssigned = true;
    } else {
      console.log('There was error while assigning the task bundle');
    }
    this.loadBundles();
  }

}
