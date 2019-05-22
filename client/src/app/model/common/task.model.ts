import { TaskGroup } from './taskType.model';

export class Task {
    public id: number;
    public taskType: TaskType;
    public active: boolean;
    public completed: boolean;
}
