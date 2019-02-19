import { TaskType } from './taskType.model';
import { User } from './user.model';
import { ImagePrototype } from './imagePrototype.model';
import { Task } from './task.model';

export class TaskPrototype {
    public id: number;
    public image: ImagePrototype;
    public taskType: TaskType;
    public user: User;
    public active: boolean;
    public completed: boolean;

    constructor(task: Task) {
        this.id = task.id;
        this.image = task.image.prototype();
        this.user = task.user;
        this.active = task.active;
        this.completed = task.completed;
    }
}
