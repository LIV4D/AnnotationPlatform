import { Task } from '../models/task.model';

export interface ITaskGroup {
    tasks: Task[];
    imageId: number;
    imageSrc: string;
    incompleteCount: number;
}
