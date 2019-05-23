import { ImagePrototype } from './imagePrototype.model';
import { Annotation } from './annotation.model';

export class AnnotationPrototype {
    public id: number;
    public image: ImagePrototype;
    public comment: string;

    constructor(annotation: Annotation) {
        this.id = annotation.id;
        this.image = annotation.image === undefined ? undefined : annotation.image.prototype();
        this.comment = annotation.comment;
    }
}
