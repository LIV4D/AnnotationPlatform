import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { TasksCompletedFacadeService } from './tasks-completed.facade.service';

import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';


@Component({
  selector: 'app-tasks-completed',
  templateUrl: './tasks-completed.html',
  styleUrls: ['./tasks-completed.component.scss']
})
export class TasksCompletedComponent implements OnInit {
  displayedColumns = ['imageSrc', 'image', 'complete', 'incomplete', 'time'];
  dataSource = new MatTableDataSource();
  showPagination: boolean;
  length: number;
  pageSize: number;
  data: any = [];
  noData: boolean;
  showCompleted: boolean;

  @ViewChild(MatSort, {static: true}) sort: MatSort;
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  constructor(private router: Router, private facadeService: TasksCompletedFacadeService) {
    this.showPagination = false;
    this.length = 0;
    this.pageSize = 25;
    this.noData = false;

    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  ngOnInit() {
    this.loadCompletedTasksData();
  }

  loadCompletedTasksData() {
    this.facadeService.loadCompletedTasksData(this);
  }

  loadImage(imageId: string): void {
    console.log('loading image');
  }

}
