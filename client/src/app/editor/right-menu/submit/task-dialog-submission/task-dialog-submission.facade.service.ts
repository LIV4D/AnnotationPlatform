import { Injectable } from '@angular/core';
import { TasksService } from '../../../../shared/services/Tasks/tasks.service';
import { Task } from '../../../../shared/models/serverModels/task.model';

@Injectable({
    providedIn: 'root'
})
export class TaskDialogSubmissionFacadeService {
    constructor(private tasksService: TasksService) {}

  // Function called upon clicking confirm in Task dialog
  // Updates all tasks with new completed value
  updateTask(task: Task): void {
    this.tasksService.updateTaskCompleteness(task);
  }
}
