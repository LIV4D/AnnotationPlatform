import { WidgetComponent } from './widget/widget.component';
import { Component, OnInit, Input, ViewChild, Output, EventEmitter } from '@angular/core';
import { BackgroundCanvas } from 'src/app/shared/models/background-canvas.model';
import { BiomarkersComponent } from './biomarkers/biomarkers.component';
import { EditorService } from 'src/app/shared/services/Editor/editor.service';
import { AppService } from 'src/app/shared/services/app.service';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-right-menu',
  templateUrl: './right-menu.component.html',
  styleUrls: ['./right-menu.component.scss']
})
export class RightMenuComponent implements OnInit {
  loaded: boolean;
  saveText: string;
  // tasks: Task[] = [];
  @Input() canvas: BackgroundCanvas;
  @Output() flip: EventEmitter<any> = new EventEmitter();
  @ViewChild('biomarkers') biomarkers: BiomarkersComponent;
  // @ViewChild(CommentsComponent) comments: CommentsComponent;

  // public commentService: CommentsService, , private taskService: TasksService
  constructor(public appService: AppService, public editorService: EditorService,
              public router: Router, public dialog: MatDialog) {
    this.loaded = false;
    this.saveText = navigator.platform.indexOf('Mac') === -1 ? '(Ctrl + S)' : '(Cmd + S)';
  }

  ngOnInit(): void {
      // this.getTasks();
  }

  // Retrieves the image types from the server
  // getTasks(): void {
  //     if (!this.editorService.imageLocal) {
  //         this.editorService.getTasks().subscribe(res => {
  //             this.tasks = res;
  //         });
  //     }
  // }

  public svgLoaded(arbre: SVGGElement[]): void {
      this.loaded = true;
      setTimeout(() => {
          this.biomarkers.init(arbre);
      }, 0);
  }

  public flipHorizontal(): void {
      this.flip.emit(null);
  }

  public saveLocal(): void {
      // this.editorService.saveSVGFile();
  }

  // public openTaskDialog(): void {
  //     if (Object.keys(this.tasks).length > 0) {
  //         this.tasks.forEach( (t) => { t.completed = true; });
  //         const dialogRef = this.dialog.open(TaskDialogComponent, {
  //             data: { tasks: this.tasks },
  //             width: '600px',
  //         });
  //         dialogRef.afterClosed().subscribe(result => {
  //             if (result) {
  //                 LocalStorage.save(this.editorService, this.editorService.layersService);
  //                 this.saveRevision(result === 'next');
  //             }
  //         });
  //     } else {
  //         this.saveRevision();
  //     }
  // }

  // public saveRevision(loadNext= false): void {
  //     this.editorService.saveToDB().subscribe(() => {
  //         if (loadNext) {
  //             this.taskService.getNextTask().subscribe((data: any) => {
  //                 if (data && data.image) {
  //                     const imageId = data.image.id.toString();
  //                     LocalStorage.resetImageId(imageId);
  //                     setTimeout(() => { window.location.reload(); }, 10);
  //                 } else {
  //                     this.router.navigate([`/${ROUTES.TASKS}`]).then(() => {setTimeout(() => { window.location.reload(); }, 10); });
  //                 }
  //             }, () => {
  //                 this.router.navigate([`/${ROUTES.TASKS}`]).then(() => {setTimeout(() => { window.location.reload(); }, 10); });
  //             });
  //         } else {
  //             if (localStorage.getItem('previousPage') === 'tasks') {
  //                 this.router.navigate([`/${ROUTES.TASKS}`]).then(() => {setTimeout(() => { window.location.reload(); }, 10); });
  //             } else {
  //                 this.router.navigate([`/${ROUTES.GALLERY}`]).then(() => {setTimeout(() => { window.location.reload(); }, 10); });
  //             }
  //         }
  //     }, error => {
  //         setTimeout(() => { window.location.reload(); }, 10);
  //     });
  // }

  // public saveDB(): void {
  //     this.openTaskDialog();
  // }

  // public onKeyDown(event: KeyboardEvent): void {
  //     if (this.appService.keyEventsEnabled) {
  //         switch (event.keyCode) {
  //             case HOTKEYS.KEY_CTRL_S_SAVE: {
  //                 if (this.commandOrCtrlPressed(event)) {
  //                     if (this.appService.localEditing) {
  //                         this.saveLocal();
  //                     } else {
  //                         this.saveDB();
  //                     }
  //                 }
  //                 break;
  //             }
  //         }
  //     }
  // }

  public commandOrCtrlPressed(event: KeyboardEvent): boolean {
      return navigator.platform.indexOf('Mac') === -1 ? event.ctrlKey : event.metaKey;
  }

}
