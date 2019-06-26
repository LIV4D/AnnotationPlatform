// import { ImagePrototype } from './imagePrototype.model';
import { Task } from './task.model';

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
        this.userId = task.user.id;
        this.taskGroupId = task.taskGroup.id;
        this.annotationId = task.annotation.id;
        this.imageId = task.image.id;
        this.isComplete = task.isComplete;
        this.isVisible = task.isVisible;
        this.comment = task.comment;
    }
}
