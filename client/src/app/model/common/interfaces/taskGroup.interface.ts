import { Task } from '../task.model';

export interface ITaskGroup {
    tasks: Task[];
    imageId: number;
    imageSrc: string;
    completeCount: number;
    incompleteCount: number;
}