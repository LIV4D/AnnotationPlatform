// From Angular
import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';

// Facade Service
import { TasksToCompleteFacadeService } from './tasks-to-Complete.facade.service';

// Ng Material
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';

// Interface and Model
import { ITaskGroup } from 'src/app/shared/interfaces/taskGroup.interface';
import { TaskType } from 'src/app/shared/models/taskType.model';
import { User } from 'src/app/shared/models/user.model';

// Rxjs
import { merge, of as observableOf } from 'rxjs';
import { catchError, startWith, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-tasks-to-complete',
  templateUrl: './tasks-to-complete.html',
  styleUrls: ['./tasks-to-complete.scss']
})
export class TasksToCompleteComponent implements OnInit, AfterViewInit {
  displayedColumns = ['imageSrc', 'imageId', 'projectTitle', 'creatorId', 'time'];
  length: number;         // Number of tasks
  pageSize: number;       // Number of tasks per page
  isCompleted: boolean;   // Choose weither to display completed or uncompleted tasks
  isDataEmpty: boolean;   // Notify when all tasks have been completed

  // List of tasks, taskTypes and Users
  dataSource: any = [];         // List of tasks
  taskTypes: TaskType[] = [];   // List of taskTypes
  selectedTaskType: string;     // TaskType selected for the filtering
  users: User[] = [];           // List of users

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(private router: Router, private taskToCompleteFacadeService: TasksToCompleteFacadeService) {
    this.isCompleted = false;
    this.pageSize = 15;
    this.isDataEmpty = false;
  }

  ngOnInit() {
    this.dataSource = new MatTableDataSource();
    this.dataSource.filterPredicate = this.configureFilterPredicate();

    this.loadTaskTypes(); // Load the list of TaskTypes
    this.loadUsers();     // Load the list of Users
  }

  ngAfterViewInit() {
    this.loadData();      // Load dataSource with tasks

    this.dataSource.paginator = this.paginator; // Set pagination on tasks List
    this.dataSource.sort = this.sort;           // Set sorting on tasks List
  }

  /**
   * Loads the list of taskTypes. This will be used for finding then displaying the taksTypeTitle
   * of the taskType of a task by matching the taskTypeIds of the list
   * with the taskTypeId of a task.
   */
  async loadTaskTypes() {
    this.taskTypes = await this.taskToCompleteFacadeService.getTaskTypes();
  }

  /**
   * Loads the list of users. This will be used for finding then displaying the name
   * of a user having created a task by matching the userIds
   * with the creatorUserId of a task.
   */
  async loadUsers() {
    this.users = await this.taskToCompleteFacadeService.getUsers();
  }

  /**
   * Loads the list of uncompleted tasks.
   * The list is added on a DataSource adapted for the mat-table
   * of Ng-Material. The pagination and the sorting are also setted
   */
  loadData() {
    this.isDataEmpty = false;

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
                             this.isCompleted);
          }),
          // Observable: Return an empty observable in the case of an error
          catchError(() => {
              console.log('there is an Error');
              setTimeout(() => (this.taskToCompleteFacadeService.appService.loading = false)); // Disable loading bar
              return observableOf([]);
          })
          // Observer: Data emited from the server are added on data
          ).subscribe((data: ITaskGroup) => {
              this.dataSource.data = data;
              this.length = this.dataSource.length;
              if (this.length === 0) { this.isDataEmpty = true; } // Notify when all tasks are completed
              setTimeout(() => (this.taskToCompleteFacadeService.appService.loading = false)); // Disable loading bar
          });
    }

  /**
   * Configures the task filter for being able to match with the taskTypeId
   * @returns filterPredicate
   */
  configureFilterPredicate() {
    return this.taskToCompleteFacadeService.configureFilterPredicate();
  }

  /**
   * Event: Filters the tasks List
   * depending on the taskType chosen by the user
   * @param filterTaskTypes: taskType selected for the filtering
   */
  applyFilter(filterTaskType: TaskType) {
    this.selectedTaskType = filterTaskType.title; // Displays the title of the taskType selected
    this.dataSource.filter = filterTaskType.id.toString().trim().toLowerCase(); // TaskTypeId converted for matching the filtering

    // Pagination updated
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  /**
   * Loads image and redirect the user on the Editor
   * @param imageId: image annotation attributed for a task
   */
  loadImage(imageId: string): void {
    this.taskToCompleteFacadeService.appService.localEditing = false;
    localStorage.setItem('previousPage', 'tasks');
    this.taskToCompleteFacadeService.loadImageFromServer(imageId);
  }
}


