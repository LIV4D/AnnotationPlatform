import { TaskGroup } from './taskType.model';

export class Task {
    public id: number;
    public taskGroup: TaskGroup;
    public isVisible: boolean;
    public isComplete: boolean;
}
