import { TaskType } from './taskType.model';

export class Task {
    public id: number = null;
    public taskTypeId: number = null;
    public annotationId: number = null;
    public isComplete = false;
    public isVisible = true;
    public comment = '';
    public assignedUserId = 0;
}
