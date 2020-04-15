import { Annotation } from './annotation.model';
import { Image } from './image.model';
import { TaskPriority } from './taskPriority.model';
import { TaskType } from './taskType.model';
import { User } from './user.model';
import { Widget } from './widget.model';

export class Task {
    public taskId = 0;
    public taskTypeId = 0;
    public annotationId = 0;
    public isComplete = false;
    public isVisible = true;
    public projectTitle = '';
    public comment = '';
    public assignedUserId = 0;
    public widgets: Widget[];
}
