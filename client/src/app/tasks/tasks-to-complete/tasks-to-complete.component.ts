// From Angular
import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { SelectionModel } from '@angular/cdk/collections';

// Facade Service
import { TasksToCompleteFacadeService } from './tasks-to-Complete.facade.service';

// Ng Material
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';

// Interface
import { ITaskGroup } from 'src/app/shared/interfaces/taskGroup.interface';

// Rxjs
import { merge, of as observableOf } from 'rxjs';
import { catchError, startWith, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-tasks-to-complete',
  templateUrl: './tasks-to-complete.html',
  styleUrls: ['./tasks-to-complete.scss']
})
export class TasksToCompleteComponent implements OnInit, AfterViewInit {
  displayedColumns = ['imageSrc', 'imageId', 'project', 'creatorName', 'time'];
  length: number;
  pageSize: number;
  dataTable: any = [];
  noData: boolean;
  showCompleted: boolean;

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(private router: Router, private taskToCompleteFacadeService: TasksToCompleteFacadeService) {
    this.showCompleted = false;
    this.pageSize = 15;
    this.noData = false;
  }

  ngOnInit() {
    this.dataTable = new MatTableDataSource();
  }

  ngAfterViewInit() {
    this.loadData();

    this.dataTable.paginator = this.paginator;
    this.dataTable.sort = this.sort;
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
        setTimeout(() => (this.taskToCompleteFacadeService.appService.loading = true)); // Enable loading bar
        // getTasks from the server
        return this.taskToCompleteFacadeService.getTasks(
                             this.paginator.pageIndex,
                             this.paginator.pageSize,
                             this.showCompleted);
          }),
          // Observable: Return an empty observable in the case of an error
          catchError(() => {
              console.log('there is an Error');
              setTimeout(() => (this.taskToCompleteFacadeService.appService.loading = false)); // Disable loading bar
              return observableOf([]);
          })
          // Observer: Data emited from the server are added on data
          ).subscribe((data: ITaskGroup) => {
              this.dataTable.data = data;
              console.log(this.dataTable.data);
              this.length = this.dataTable.length;
              if (this.length === 0) { this.noData = true; }
              setTimeout(() => (this.taskToCompleteFacadeService.appService.loading = false)); // Disable loading bar
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



