// import { ImagePrototype } from './imagePrototype.model';
import { Task } from './task.model';
import { isNullOrUndefined } from 'util';

export class TaskPrototype {
    public id: number;
    public taskGroupId: number;
    public annotationId: number;
    public userId: number;
    public imageId: number;
    public isComplete: boolean;
    public isVisible: boolean;
    public comment: string;
    constructor(task: Task) {
        this.id = task.id;
        this.userId = !isNullOrUndefined(task.user) ? task.user.id : null;
        this.taskGroupId = !isNullOrUndefined(task.taskGroup) ? task.taskGroup.id : null;
        this.annotationId = !isNullOrUndefined(task.annotation) ? task.annotation.id : null;
        this.imageId = !isNullOrUndefined(task.image) ? task.image.id : null;
        this.isComplete = task.isComplete;
        this.isVisible = task.isVisible;
        this.comment = task.comment;
    }
}
