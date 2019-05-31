import { Task } from './task.model';
export class TaskGroup {
    public id: number;
    public tasks: Task[];
    public title: string;
    public description: string;
}
