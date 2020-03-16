import { Task } from '../models/task.model';

export interface ITaskBundle {
    taskType?: string;
    taskTypeDescription?: string;
    bundle?: Task[];
    bundleThumbnails?: string[];
}
