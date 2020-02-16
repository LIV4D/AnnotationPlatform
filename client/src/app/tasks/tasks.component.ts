import { Component, OnInit, ViewChild, ChangeDetectorRef, AfterViewChecked } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { TaskFacadeService } from './tasks.facade.service';
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

   constructor( private router: Router, private facadeService: TaskFacadeService) {
  //   private editorService: EditorService) {
  //   this.showPagination = false;
  //   this.length = 0;
  //   this.pageSize = 25;
  //   this.noData = false;
   }

    ngOnInit(): void {
        this.facadeService.loadData();
    }

    loadImage(imageId: string): void {
      this.facadeService.loadImage(imageId);
    }

    showComplete(): void {
      this.facadeService.showComplete();
    }

    showIncomplete(): void {
      this.facadeService.showIncomplete();
    }
}

