import { Component, OnInit } from '@angular/core';
import { SubmitFacadeService } from './submit.facade.service';
import { Task } from 'src/app/shared/models/serverModels/task.model';
import { MatDialog } from '@angular/material/dialog';
import { TaskDialogSubmissionComponent } from './task-dialog-submission/task-dialog-submission.component';

@Component({
  selector: 'app-submit',
  templateUrl: './submit.component.html',
  styleUrls: ['./submit.component.scss']
})
export class SubmitComponent implements OnInit {
  saveTooltip: string;
  nextTask: Task;

  constructor(public submitFacadeService: SubmitFacadeService,
              public dialog: MatDialog) {
    this.saveTooltip = this.submitFacadeService.getSaveShortCutToolTipText() // shortcut shown in the tooltip
  }

  ngOnInit(): void {
    this.loadTasks();

  }

  // load the tasks matching with the current user and the image loaded in Editor
  async loadTasks(){
    if (!this.submitFacadeService.editorService.imageLocal) {
      //const imageId = await this.submitFacadeService.editorService.imageId;
      //this.tasks = await this.submitFacadeService.getTasks(imageId);
      this.nextTask = await this.submitFacadeService.getNextTask();
    }
  };

  // save on local editing
  public saveLocal(): void {
    this.submitFacadeService.saveLocal();
  }

  public saveOnDB(): void {
    this.openTaskDialog();
  }

  public openTaskDialog(): void {

    // Checkbox checked by default with the task set as completed in local
    if (Object.keys(this.nextTask).length > 0) {
      this.submitFacadeService.completeTask(this.nextTask);

    // Save taskDialog pops out
   	const dialogRef = this.dialog.open(TaskDialogSubmissionComponent, {
        	data: { task: this.nextTask },
                  width: '600px',
          });

    this.submitFacadeService.afterClosedTaskDialog(dialogRef);
    } else {
      this.saveRevision();
    }
  }

  public saveRevision(loadNext= false): void {
    this.submitFacadeService.saveRevision(loadNext);
  }
}
