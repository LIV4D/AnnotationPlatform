import { ITasks } from './ITasks.interface';

export interface ITaskBundle {
    taskType?: string;
    taskTypeDescription?: string;
    bundle?: ITasks[];
    bundleThumbnails?: string[];
}


