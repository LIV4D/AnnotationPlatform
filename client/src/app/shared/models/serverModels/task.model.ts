import { TaskType } from './taskType.model';
import { TaskPriority } from './taskPriority.model';
import { User } from './user.model';
import { Annotation } from './annotation.model';
import { Widget } from './widget.model';

export class Task {
    public id = 0;
    public taskTypeId = 0;
    public annotationId = 0;
    public isComplete = false;
    public isVisible = true;
    public projectTitle = '';
    public comment = '';
    public assignedUserId = 0;
    public widgets: Widget[];
}
