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
  displayedColumns: string[] = ['selectTasks', 'imageSrc', 'imageId', 'taskTypeTitle', 'projectTitle', 'time', 'lastModifiedTime'];
  length: number;       // Number of tasks
  pageSize: number;     // Number of tasks per page
  isCompleted: boolean; // Choose weither to display completed or uncompleted tasks

  // List of tasks and taskTypes
  dataTable: any = [];
  taskTypes: TaskType[] = [];

  // task selected by the user to be archived
  taskSelection = new SelectionModel(true, []);

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort , {static: true}) sort: MatSort;

  constructor(private router: Router, private tasksCompletedFacadeService: TasksCompletedFacadeService) {
    this.isCompleted = true;
    this.pageSize = 15;
  }

  ngOnInit() {
    this.dataTable = new MatTableDataSource();
    this.loadTaskTypes(); // Load the list of TaskTypes
  }

  ngAfterViewInit() {
    this.loadData();      // Load dataSource with completed tasks

    this.dataTable.paginator = this.paginator;
    this.dataTable.sort = this.sort;
  }

  /**
   * Loads the list of completed assigned tasks.
   * The list is added on a DataSource adapted for the mat-table
   * of Ng-Material. The pagination and the sorting are also setted
   */
  loadData() {
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
                             this.isCompleted);
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
              this.length = this.dataTable.length;
              setTimeout(() => (this.tasksCompletedFacadeService.appService.loading = false)); // Disable loading bar
          });
  }

  /**
   * Loads the list of taskTypes. This will be used for finding then displaying the taksTypeTitle
   * of the taskType of a task by matching the taskTypeIds of the list
   * with the taskTypeId of a task.
   */
  async loadTaskTypes() {
    this.taskTypes = await this.tasksCompletedFacadeService.getTaskTypes();
  }

  /**
   * Loads image and redirect the user on the Editor
   * @param imageId: image annotation attributed for a task
   */
  loadImage(imageId: string): void {
    this.tasksCompletedFacadeService.appService.localEditing = false;
    localStorage.setItem('previousPage', 'tasks');
    this.tasksCompletedFacadeService.loadImageFromServer(imageId);
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const selectionLength = this.taskSelection.selected.length;
    const dataLength = this.dataTable.data.length;
    return this.tasksCompletedFacadeService.isAllSelected(selectionLength, dataLength);
  }

  /**
   * Event: Removes selected rows on the view.
   * The server updates the tasks so the one removes became hidden
   */
  removeSelectedRows() {
    // Find the index of the selected task
    this.taskSelection.selected.forEach(task => {
      const index: number = this.dataTable.data.findIndex(predicate => predicate === task);
      this.dataTable.data.splice(index, 1);                                   // Remove the task from the dataTable
      this.tasksCompletedFacadeService.ArchiveTaskApp(task.taskId);           // Set the task to hidden in the serve to archive it
      setTimeout(() => {this.dataTable.paginator = this.paginator; });        // Reorganise the pagination
    });
    this.taskSelection = new SelectionModel(true, []);                        // Empty the selection
  }

  /**
   * Event: Selects all rows if they are not all selected;
   * otherwise clear taskSelection.
   */
  masterToggle() {
    this.isAllSelected() ?
      this.taskSelection.clear() :
      this.dataTable.data.forEach(row => this.taskSelection.select(row));
  }
}