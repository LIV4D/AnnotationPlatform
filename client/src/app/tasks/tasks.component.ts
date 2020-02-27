import { Component, OnInit, ViewChild, ChangeDetectorRef, AfterViewChecked } from '@angular/core';
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
export class TasksComponent implements OnInit {
    displayedColumns = ['imageSrc', 'image', 'complete', 'incomplete', 'time'];
    dataSource = new MatTableDataSource();
    showPagination: boolean;
    length: number;
    pageSize: number;
    data: any = [];
    completedTasksData: any = [];
    noData: boolean;
    showCompleted: boolean;


    @ViewChild(MatSort, {static: true}) sort: MatSort;
    @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;

   constructor( private router: Router, private facadeService: TaskFacadeService) {
     this.showPagination = false;
     this.length = 0;
     this.pageSize = 25;
     this.noData = false;

     this.dataSource.paginator = this.paginator;
     this.dataSource.sort = this.sort;
   }

    ngOnInit(): void {
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
