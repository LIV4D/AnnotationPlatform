import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { TasksCompletedFacadeService } from './tasks-completed.facade.service';

import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';

import { ITaskGroup } from 'src/app/shared/interfaces/taskGroup.interface';

import { merge, of as observableOf } from 'rxjs';
import { catchError, startWith, switchMap } from 'rxjs/operators';
import { DataSource } from '@angular/cdk/table';


@Component({
  selector: 'app-tasks-completed',
  templateUrl: './tasks-completed.html',
  styleUrls: ['./tasks-completed.component.scss']
})
export class TasksCompletedComponent implements OnInit, AfterViewInit {
  displayedColumns = ['imageSrc', 'imageId', 'complete', 'incomplete', 'time'];
  showPagination: boolean;
  length: number;
  pageSize: number;
  data: any = [];
  noData: boolean;
  showCompleted: boolean;
  dataSource = new MatTableDataSource();

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(private router: Router, private tasksCompletedFacadeService: TasksCompletedFacadeService) {
    this.showPagination = true;
    //this.length = 0;
    this.pageSize = 25;
    this.noData = false;
  }

  ngOnInit() {
    this.data = new MatTableDataSource();
  }

  ngAfterViewInit() {
    this.loadData();
  }

  loadData() {
    this.noData = false;
    // If the user changes the sort order, reset back to the first page.
    this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);

    // Observable: Converts sortChange and page Observables into a single Observable
    // The new observable emits all of the items emitted by all of those Observables.
    merge(this.sort.sortChange, this.paginator.page)
      .pipe(
      // BehaviorSubject: emmiting empty at the begining
      startWith({}),
      // Observable: Switch to a new observable each time the request change
      switchMap(() => {

        setTimeout(() => (this.tasksCompletedFacadeService.appService.loading = true)); // Enable loading bar
        // getTasks from the server
        return this.tasksCompletedFacadeService.getTasks(
                             this.sort.active,
                             this.sort.direction,
                             this.paginator.pageIndex,
                             this.paginator.pageSize,
                             this.showCompleted);
          }),
          // Observable: Return an empty observable in the case of an error
          catchError(() => {
              console.log('there is an Error');
              setTimeout(() => (this.tasksCompletedFacadeService.appService.loading = false)); // Disable loading bar
              return observableOf([]);
          })
          // Observer: Data emited from the server are added on data
          ).subscribe((data: ITaskGroup) => {

              this.pageSize = 15;
              this.data = data;
              console.log(this.data);
              // .data = this.data.tasks.filter (
              // filteredData => filteredData.completed === false);
              this.length = this.data.length;
              this.dataSource = new MatTableDataSource(this.data);

              if (this.length === 0) { this.noData = true; }
              setTimeout(() => (this.tasksCompletedFacadeService.appService.loading = false));
          });
  }

  loadImage(imageId: string): void {
    console.log('loading image');
  }

}


/// REFERENCE FOR LATER
// Mat-Table API: See HTML example
// https://material.angular.io/components/table/overview
// https://material.angular.io/components/table/examples
//
//
// How to make filters (usefull for making Task-To-Complete: Mock Up version)
// https://stackblitz.com/edit/angular-7w9ajc-pidehb?file=app%2Ftable-overview-example.ts
//
// How to make subSection (usefull for making Task-To-Complete: Gaby version)
// https://stackblitz.com/edit/angular-mattable-with-groupheader?file=app%2Ftable-basic-example.html
//
// Gallery from old project: Very well made compared with old Tasks, might be usefull for filters
//
