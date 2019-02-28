import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material';
import { EditorService } from './../../editor/editor.service';

@Component({
    selector: 'task-dialog',
    templateUrl: './task-dialog.component.html',
    styleUrls: ['./task-dialog.component.scss']
})
export class TaskDialogComponent {
    constructor(@Inject(MAT_DIALOG_DATA) public data: any, public editorService: EditorService) {}

    // Function called upon clicking confirm in Task dialog
    // Updates all tasks with new completed value
    closeDialog(): void {
        this.editorService.updateTasks(this.data.tasks);
    }

    // Function called upon clicking cancel in Task dialog
    cancelDialog(): void {
    }

    // Function called upon clicking a checkbox in Task dialog
    // Updates checked task with new completed value
    checkTask(checkValue, taskId): void {
        this.data.tasks.find(x => x.id === taskId).completed = checkValue;
    }
}
