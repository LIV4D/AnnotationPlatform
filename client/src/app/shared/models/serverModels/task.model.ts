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
