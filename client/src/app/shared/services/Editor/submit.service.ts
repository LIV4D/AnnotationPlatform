import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
    providedIn: 'root'
})
export class SubmitService {

    constructor(private http: HttpClient ) {
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
}
