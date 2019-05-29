import { ImagePrototype } from './imagePrototype.model';
import { Annotation } from './annotation.model';
import { Task } from './task.model';

export class AnnotationPrototype {
    public id: number;
    public image: ImagePrototype;
    public comment: string;
    public tasks: Task[];

    constructor(annotation: Annotation) {
        this.id = annotation.id;
        this.image = annotation.image === undefined ? undefined : annotation.image.prototype();
        this.comment = annotation.comment;
        this.tasks = annotation.tasks;
    }
}
