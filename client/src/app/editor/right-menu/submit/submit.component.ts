import { Component, OnInit } from '@angular/core';
import { SubmitFacadeService } from './submit.facade.service';
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
    this.loadTaskType();

  }

  // load the task matching with the current user and the image loaded in Editor
  async loadTask(){
      await this.submitFacadeService.loadTask();
    }

  // load the taskType matching with the current TaskType
  async loadTaskType(){
    await this.submitFacadeService.loadTaskTypeById();
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
    const currentTaskType = this.submitFacadeService.getCurrentTaskType();

    // Checkbox checked by default with the task set as completed in local
    if (currentTask !== null && currentTask !== undefined) {
        this.submitFacadeService.completeTask(currentTask);

        // Save taskDialog pops out
        const dialogRef = this.dialog.open(TaskDialogSubmissionComponent, {
            data: { task: currentTask, taskType:currentTaskType }, 
            width: '600px',
        });

        // Action after the dialog has been closed
        this.submitFacadeService.afterClosedTaskDialog(dialogRef);
    } else {
      this.saveAnnotation();
    }
  }

  public saveAnnotation(loadNextHasBeenSelected= false): void {
	this.submitFacadeService.saveAnnotation(loadNextHasBeenSelected);
  }
}
