import { Task } from './../../shared/models/task.model';
import { MatCard } from '@angular/material/card';
import { Component, OnInit } from '@angular/core';
import { TasksBundlesFacadeService } from './tasks-bundles.facade.service';

@Component({
  selector: 'app-tasks-bundles',
  templateUrl: './tasks-bundles.component.html',
  styleUrls: ['./tasks-bundles.component.scss']
})
export class TasksBundlesComponent implements OnInit {

  displayedColumns = ['quantity', 'images', 'Task type', 'Description', 'Estimated time'];
  bundles: any = [];
  noData: boolean;

  constructor(private facadeService: TasksBundlesFacadeService) {
  }

  ngOnInit(): void {
    // this.loadBundles();
  }

  loadBundles() {
    this.facadeService.loadBundles(this);
  }

}
