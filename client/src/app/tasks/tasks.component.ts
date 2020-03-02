import { Component, OnInit, ViewChild, ChangeDetectorRef, AfterViewChecked, AfterViewInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { TaskFacadeService } from './tasks.facade.service';
import { Router } from '@angular/router';
import { ITasks } from '../shared/interfaces/ITasks.interface';
// import { EditorService } from '../edit-layout/editor/editor.service';



@Component({
  selector: 'app-tasks',
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.scss']
})
export class TasksComponent implements OnInit, AfterViewInit {
    displayedColumns = ['imageSrc', 'image', 'complete', 'incomplete', 'time'];
    dataSource = new MatTableDataSource();
    showPagination: boolean;
    length = 0 ;
    pageSize: number;
    data: any = [];
    noData = false;
    showCompleted: boolean;

    @ViewChild(MatSort) sort: MatSort;
    @ViewChild(MatPaginator) paginator: MatPaginator;

   constructor( private router: Router, private facadeService: TaskFacadeService) {
     this.showPagination = false;
     this.length = length;
     this.pageSize = 25;
     this.noData = false;
   }

   ngOnInit() {
    this.dataSource = new MatTableDataSource(this.data);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
   }

   ngAfterViewInit() {
      // If the user changes the sort order, reset back to the first page.
      this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);
      this.LoadData();
  }


    /**
     * Logs tasks component: Executed each time a tab is changed
     * May be usefull
     * @param val: event
     */
    log(val) { }

    LoadData() {
      this.facadeService.loadData(this);
    }

    loadImage(imageId: string): void {
      this.facadeService.loadImage(imageId);
    }

    showComplete(): void {
      this.showCompleted = true;
      this.LoadData();
    }

    showIncomplete(): void {
      this.showCompleted = false;
      this.LoadData();
    }
}
