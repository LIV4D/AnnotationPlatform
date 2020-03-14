import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Task } from '../../models/task.model';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { TaskDialogSubmissionComponent } from 'src/app/editor/right-menu/submission/task-dialog-submission/task-dialog-submission.component';
import { Observable } from 'rxjs';
import { LocalStorage } from './local-storage.service';
import { EditorService } from './editor.service';

@Injectable({
    providedIn: 'root'
})
export class SubmitService {

    constructor(private http: HttpClient, public editorService: EditorService) {
    }

    // Return the shortcut command depending on the OS of the user's system
    getSaveShortCutToolTipText(): string{
      return navigator.platform.indexOf('Mac') === -1 ? '(Ctrl + S)' : '(Cmd + S)';
    }

    updateTasks(tasks: any[]): void {
      // server takes 'true' and 'false' instead of booleans
      tasks.forEach(task => {
        const body = {
          active: task.isVisible ? 'true' : 'false',
          completed: task.isComplete ? 'true' : 'false',
        };
      this.http.put(`/api/tasks/${task.id}`, body).subscribe();
      });
    }

    completeTasks(tasks: Task[]) {
      tasks.forEach( (task) => { task.isComplete = true; });
    }

    afterClosedTaskDialog(dialogRef: MatDialogRef<any, any>) {
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          LocalStorage.save(this.editorService, this.editorService.layersService);
          //this.saveRevision(result === 'next');
        }
      });
    }
}
