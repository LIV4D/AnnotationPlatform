import { Component, OnInit, ViewChild, ChangeDetectorRef, AfterViewChecked } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { AppService } from '../shared/services/app.service';
import { Router } from '@angular/router';
// import { EditorService } from '../edit-layout/editor/editor.service';
// import { TasksService } from '../shared/services/app.service';
import { merge, of as observableOf } from 'rxjs';
import { catchError, startWith, switchMap } from 'rxjs/operators';
import { ITaskList } from '../shared/interfaces/taskList.interface';
import { $ } from 'protractor';

@Component({
  selector: 'app-tasks',
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.scss']
})
export class TasksComponent implements OnInit {
    displayedColumns = ['imageSrc', 'image', 'complete', 'incomplete'];
    dataSource = new MatTableDataSource();
    showPagination: boolean;
    length: number;
    pageSize: number;
    data: any = [];
    noData: boolean;
    showCompleted: boolean;
    @ViewChild(MatSort) sort: MatSort;
    @ViewChild(MatPaginator) paginator: MatPaginator;

  // constructor(private appService: AppService, private router: Router, private tasksService: TasksService,
  //   private editorService: EditorService) {
  //   this.showPagination = false;
  //   this.length = 0;
  //   this.pageSize = 25;
  //   this.noData = false;
  // }

    ngOnInit(): void {
        this.loadData();
    }

    loadData(): void {
      console.log('loadData');
    }

    loadImage(imageId: string): void {
      console.log('loadImage');
    }

    showComplete(): void {
      console.log('showComplete');
    }

    showIncomplete(): void {
        console.log('showIncomplete');
    }
}

