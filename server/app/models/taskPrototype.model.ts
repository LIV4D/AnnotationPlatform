import { TaskGroup } from './taskGroup.model';
import { User } from './user.model';
// import { ImagePrototype } from './imagePrototype.model';
import { Task } from './task.model';
import { Annotation } from './annotation.model';

export class TaskPrototype {
    public id: number;
    // public image: ImagePrototype;
    public taskGroup: TaskGroup;
    public annotation: Annotation;
    public user: User;
    public isComplete: boolean;
    public isVisible: boolean;
    public comment: string;
    constructor(task: Task) {
        this.id = task.id;
        // this.image = task.image === undefined ? undefined : task.image.prototype();
        this.user = task.user;
        this.isVisible = task.isVisible;
        this.isComplete = task.isComplete;
        this.taskGroup = task.taskGroup;
        this.annotation = task.annotation;
    }
}
