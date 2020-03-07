import { TaskType } from './taskType.model';
import { TaskPriority } from './taskPriority.model';
import { User } from './user.model';
import { ImageType } from './imageType.model';

export class Task {
    public taskTypeId = 0;
    public annotationId = 0;
    public isComplete = false;
    public isVisible = true;
    public comment = '';
    public assignedUserId = 0;
}
