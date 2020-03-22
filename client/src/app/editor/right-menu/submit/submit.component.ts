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

  constructor(public submitFacadeService: SubmitFacadeService,
              public dialog: MatDialog) {
    this.saveTooltip = this.submitFacadeService.getSaveShortCutToolTipText() // shortcut shown in the tooltip
  }

  ngOnInit(): void {
    this.loadTask();

  }

  // load the tasks matching with the current user and the image loaded in Editor
  async loadTask(){
      //const imageId = await this.submitFacadeService.editorService.imageId;
      //this.tasks = await this.submitFacadeService.getTasks(imageId);
      await this.submitFacadeService.loadTask();
    }

  // save on local editing
  public saveLocal(): void {
    this.submitFacadeService.saveLocal();
  }

  public saveOnDB(): void {
    this.openTaskDialog();
  }

  public openTaskDialog(): void {
    const currentTask = this.submitFacadeService.getCurrentTask();

    // Checkbox checked by default with the task set as completed in local
    if (Object.keys(currentTask).length > 0) {
      this.submitFacadeService.completeTask(currentTask);

    // Save taskDialog pops out
    const dialogRef = this.dialog.open(TaskDialogSubmissionComponent, {
	    data: { task: currentTask },
        width: '600px',
    });

    // Action after the dialog has been closed
    this.submitFacadeService.afterClosedTaskDialog(dialogRef);
    } else {
      this.saveRevision();
    }
  }

  public saveRevision(loadNext= false): void {
	this.submitFacadeService.saveRevision(loadNext);
  }
}
