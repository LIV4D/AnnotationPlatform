import { Component, OnInit, ViewChild, ChangeDetectorRef, AfterViewChecked } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { AppService } from '../app.service';
import { ROUTES } from './../routes';
import { Router } from '@angular/router';
import { EditorService } from '../edit-layout/editor/editor.service';
import { TasksService } from './tasks.service';
import { merge, of as observableOf } from 'rxjs';
import { catchError, startWith, switchMap } from 'rxjs/operators';
import { $ } from 'protractor';
import { ITaskGallery } from '../../../../common/common_interfaces/interfaces';

@Component({
  selector: 'app-tasks',
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.scss']
})
export class TasksComponent implements OnInit {
    displayedColumns = ['thumbnail', 'taskId', 'taskGroupTitle', 'imageId'];
    dataSource = new MatTableDataSource();
    showPagination: boolean;
    length: number;
    pageSize: number;
    data: any = [];
    noData: boolean;
    showCompleted: boolean;
    @ViewChild(MatSort) sort: MatSort;
    @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(private appService: AppService, private router: Router, private tasksService: TasksService,
    private editorService: EditorService) {
    this.showPagination = false;
    this.length = 0;
    this.pageSize = 25;
    this.noData = false;
  }

    ngOnInit(): void {
        this.loadData();
    }

    loadData(): void {
        this.noData = false;
        this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);
        merge(this.sort.sortChange, this.paginator.page)
            .pipe(
            startWith({}),
            switchMap(() => {
                this.appService.loading = true;
                return this.tasksService.getTasks(this.paginator.pageIndex, this.pageSize, this.showCompleted);
            }),
            catchError(() => {
                this.appService.loading = false;
                return observableOf([]);
            })
            ).subscribe((data: ITaskGallery[]) => {
                this.data = data;
                this.length = data.length;
                this.noData = (this.length === 0);
                this.appService.loading = false;
            });
    }

    loadImage(imageId: string): void {
        this.appService.localEditing = false;
        localStorage.setItem('previousPage', 'tasks');
        this.editorService.loadImageFromServer(imageId);
    }

    showComplete(): void {
        this.showCompleted = true;
        this.loadData();
    }

    showIncomplete(): void {
        this.showCompleted = false;
        this.loadData();
    }
}

