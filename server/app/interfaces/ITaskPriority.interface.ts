import { Task } from './../models/task.model';

export interface ITaskPriority {
    // id: number;
    taskId?: number;
    userId?: number;
    priority?: number;
    task?: Task;
}
