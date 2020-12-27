import { Component, OnInit, Inject } from '@angular/core';
import { TaskDialogSubmissionFacadeService } from './task-dialog-submission.facade.service';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';

@Component({
  selector: 'app-task-dialog-submission',
  templateUrl: './task-dialog-submission.component.html',
  styleUrls: ['./task-dialog-submission.component.scss']
})
export class TaskDialogSubmissionComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
              public taskDialogSubmissionFacadeService: TaskDialogSubmissionFacadeService) { }

  ngOnInit(): void {}

  // Function called upon clicking confirm in Task dialog
  // Updates all tasks with new completed value
  closeDialog(): void {
    this.taskDialogSubmissionFacadeService.updateTask(this.data.task);
  }

  // Function called upon clicking cancel in Task dialog
  cancelDialog(): void {}

  // Checkbox toggles completeness of the task
  checkTask(checkValue): void {
    this.data.task.isComplete = checkValue;
  }

}