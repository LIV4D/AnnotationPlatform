import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Task } from '../../models/serverModels/task.model';
import { MatDialogRef } from '@angular/material/dialog';
import { LocalStorage } from './local-storage.service';
import { EditorService } from './editor.service';
import { TasksService } from '../tasks/tasks.service';
import { Router } from '@angular/router';

@Injectable({
    providedIn: 'root'
})
export class SubmitService {
    constructor(private http: HttpClient,
                public editorService: EditorService,
                private tasksService: TasksService,
                private router: Router) {}

    // Return the shortcut command depending on the OS of the user's system
    getSaveShortCutToolTipText(): string{
      return navigator.platform.indexOf('Mac') === -1 ? '(Ctrl + S)' : '(Cmd + S)';
    }

    /**
     * Set a task as completed
     * @param nextTask: task submited by a user
     */
    completeTask(nextTask: Task) {
      nextTask.isComplete = true;
    }

    afterClosedTaskDialog(dialogRef: MatDialogRef<any, any>) {
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          LocalStorage.save(this.editorService, this.editorService.layersService);
          this.saveRevision(result === 'next');
        }
      });
    }

  	public saveRevision(loadNext= false): void {
    	this.editorService.saveToDB().subscribe(() => {
          if (loadNext) {
              this.tasksService.getNextTask().subscribe((data: any) => {
                  if (data && data.annotation) {
                      const imageId = data.annotation.image.id.toString();
                      LocalStorage.resetImageId(imageId);
                      setTimeout(() => { window.location.reload(); }, 10);
                  } else {
                      this.router.navigate(['/tasks']).then(() => {setTimeout(() => { window.location.reload(); }, 10); });
                  }
              }, () => {
                  this.router.navigate(['/tasks']).then(() => {setTimeout(() => { window.location.reload(); }, 10); });
              });
          } else {
              if (localStorage.getItem('previousPage') === 'tasks') {
                  this.router.navigate(['/tasks']).then(() => {setTimeout(() => { window.location.reload(); }, 10); });
              } else {
                  this.router.navigate(['/gallery']).then(() => {setTimeout(() => { window.location.reload(); }, 10); });
              }
          }
      }, error => {
          setTimeout(() => { window.location.reload(); }, 10);
      });
  }
}
