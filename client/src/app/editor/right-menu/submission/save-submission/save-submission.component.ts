import { Component, OnInit } from '@angular/core';
import { SaveSubmissionFacadeService } from './save-submission.facade.service';
import { Task } from 'src/app/shared/models/task.model';
import { MatDialog } from '@angular/material/dialog';
import { TaskDialogSubmissionComponent } from '../task-dialog-submission/task-dialog-submission.component';

@Component({
  selector: 'app-save-submission',
  templateUrl: './save-submission.component.html',
  styleUrls: ['./save-submission.component.scss']
})
export class SaveSubmissionComponent implements OnInit {
  saveTooltip: string;
  tasks: Task[] = [];

  constructor(public saveSubmissionFacadeService: SaveSubmissionFacadeService,
              public dialog: MatDialog) {
    this.saveTooltip = this.saveSubmissionFacadeService.getSaveShortCutToolTipText() // shortcut shown in the tooltip
  }

  ngOnInit(): void {
    this.loadTasks();
  }

  // load the tasks matchinG with the current user and the image loaded in Editor
  async loadTasks(){
    const imageId = await this.saveSubmissionFacadeService.editorService.imageId;
    this.tasks = await this.saveSubmissionFacadeService.getTasks(imageId);
  };

  // save on local editing
  public saveLocal(): void {
    this.saveSubmissionFacadeService.saveLocal();
}

  public saveOnDB(): void {
    this.openTaskDialog();
  }

  public openTaskDialog(): void {
    if (Object.keys(this.tasks).length > 0) {
      this.tasks.forEach( (t) => { t.isComplete = true; });
   		const dialogRef = this.dialog.open(TaskDialogSubmissionComponent, {
        	data: { tasks: this.tasks },
               width: '600px',
           });
  //         dialogRef.afterClosed().subscribe(result => {
  //             if (result) {
  //                 LocalStorage.save(this.editorService, this.editorService.layersService);
  //                 this.saveRevision(result === 'next');
  //             }
  //         });
  //     } else {
  //         this.saveRevision();
       }
   }



  // Retrieves the image types from the server
  // getTasks(): void {
  //     if (!this.editorService.imageLocal) {
  //         this.editorService.getTasks().subscribe(res => {
  //             this.tasks = res;
  //         });
  //     }
  // }
   //}

}
