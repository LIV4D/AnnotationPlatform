import { TaskType } from './taskType.model';

export class Task {
    public id: number = null;
    public taskType: TaskType = null;
    public active: boolean = null;
    public completed: boolean = null;
}
