// From Angular
import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { SelectionModel } from '@angular/cdk/collections';

// Facade Service
import { TasksCompletedFacadeService } from './tasks-completed.facade.service';

// Ng Material
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';

// Interface
import { ITaskGroup } from 'src/app/shared/interfaces/taskGroup.interface';

// Model
import { TaskType } from 'src/app/shared/models/taskType.model';

// Rxjs
import { merge, of as observableOf } from 'rxjs';
import { catchError, startWith, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-tasks-completed',
  templateUrl: './tasks-completed.html',
  styleUrls: ['./tasks-completed.component.scss']
})
export class TasksCompletedComponent implements OnInit, AfterViewInit {
  displayedColumns = ['selectTasks', 'imageSrc', 'imageId', 'taskTypeTitle', 'project', 'time', 'lastModified'];
  length: number;
  pageSize: number;
  dataTable: any = [];
  taskTypes: TaskType[] = [];
  noData: boolean;
  showCompleted: boolean;
  selection = new SelectionModel(true, []);

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(private router: Router, private tasksCompletedFacadeService: TasksCompletedFacadeService) {
    this.showCompleted = true;
    this.pageSize = 15;
    this.noData = false;
  }

  ngOnInit() {
    this.dataTable = new MatTableDataSource();
    this.loadTaskTypes();
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
        setTimeout(() => (this.tasksCompletedFacadeService.appService.loading = true)); // Enable loading bar
        // getTasks from the server
        return this.tasksCompletedFacadeService.getTasks(
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
              this.dataTable.data = data;
              console.log(this.dataTable.data);
              this.length = this.dataTable.length;
              if (this.length === 0) { this.noData = true; }
              setTimeout(() => (this.tasksCompletedFacadeService.appService.loading = false)); // Disable loading bar
          });
  }

  async loadTaskTypes() {
    this.taskTypes = await this.tasksCompletedFacadeService.getTaskTypes();
  }

  loadImage(imageId: string): void {
    this.tasksCompletedFacadeService.appService.localEditing = false;
    localStorage.setItem('previousPage', 'tasks');
    this.tasksCompletedFacadeService.loadImageFromServer(imageId);
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const selectionLength = this.selection.selected.length;
    const dataLength = this.dataTable.data.length;
    return selectionLength === dataLength;
  }

  removeSelectedRows() {
    this.selection.selected.forEach(task => {
      const index: number = this.dataTable.data.findIndex(d => d === task);   // get the index of the selected task
      this.dataTable.data.splice(index, 1);                                   // remove the task from the dataTable
      this.tasksCompletedFacadeService.hideTaskApp(task.taskId);              // set the task to hidden in the serve to archive it
      this.dataTable = new MatTableDataSource<Element>(this.dataTable.data);
      setTimeout(() => {
      this.dataTable.paginator = this.paginator;                              // reorganise the pagination
      });
    });
    this.selection = new SelectionModel<Element>(true, []);                   // empty the selection
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected() ?
      this.selection.clear() :
      this.dataTable.data.forEach(row => this.selection.select(row));
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
