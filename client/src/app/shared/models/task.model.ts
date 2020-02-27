import { TaskType } from './taskType.model';

export class Task {
    public id = 0;
    public taskTypeId = 0;
    public annotationId = 0;
    public isComplete = false;
    public isVisible = true;
    public comment = '';
    public assignedUserId = 0;
}
