import { ITasksBundles } from './../../shared/interfaces/ITasksBundles.interface';
import { Task } from './../../shared/models/task.model';
import { MatCard } from '@angular/material/card';
import { Component, OnInit } from '@angular/core';
import { TasksBundlesFacadeService } from './tasks-bundles.facade.service';
import { ITasks } from 'src/app/shared/interfaces/ITasks.interface';
import { isNullOrUndefined } from 'util';

@Component({
  selector: 'app-tasks-bundles',
  templateUrl: './tasks-bundles.component.html',
  styleUrls: ['./tasks-bundles.component.scss']
})
export class TasksBundlesComponent implements OnInit {

  bundles: ITasksBundles = {
    primaryBundle: [],
    primaryTaskType: 'Task type',
    primaryTaskTypeDescription: 'Description',
    secondaryBundle: [],
    secondaryTaskType: 'Task type',
    secondaryTaskTypeDescription: 'Description',
    tertiaryBundle: [],
    tertiaryTaskType: 'Task type',
    tertiaryTaskTypeDescription: 'Description',
  } ;

  noData: boolean;

  constructor(private facadeService: TasksBundlesFacadeService) {
  }

  ngOnInit(): void {
    this.loadBundles();
  }

  loadBundles() {
    this.facadeService.loadBundles(this);
  }

  areBundlesEmpty() {
    return isNullOrUndefined(this.bundles) || (
          isNullOrUndefined(this.bundles.primaryBundle) || this.bundles.primaryBundle.length === 0 &&
          isNullOrUndefined(this.bundles.secondaryBundle) || this.bundles.secondaryBundle.length === 0 &&
          isNullOrUndefined(this.bundles.tertiaryBundle) || this.bundles.tertiaryBundle.length === 0);
  }

  async assignBundleTasks(tasks: ITasks[]) {
    const taskIds = [];
    tasks.forEach(task => {
      taskIds.push(task.id);
    });
    const res = await this.facadeService.assignBundleTasks(taskIds);
    console.log(res);
  }

}
