import 'reflect-metadata';
import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, OneToMany, JoinColumn, OneToOne } from 'typeorm';
import { Image, ImagePrototype } from './image.model';
import { SubmissionEvent, SubmissionEventPrototype } from './submissionEvent.model';
import { Task } from './task.model';

export class StringHierarchy { [key:string]: StringHierarchy | string}

export class AnnotationData {
    biomarker: {[key: string]: Buffer};
    hierarchy: StringHierarchy;
    nongraphic: {[key: string]: string | Boolean | Buffer | number}
}

@Entity()
export class Annotation {

    @PrimaryGeneratedColumn('increment')
    public id: number;

    @ManyToOne(type => Image, image => image.annotations)
    public image: Image;

    @OneToOne(type => SubmissionEvent, evenements => evenements.annotation)
    @JoinColumn()
    public lastSubmissionEvent: SubmissionEvent;

    @OneToMany(type => Task, tasks => tasks.annotation)
    public tasks: Task[];

    @Column('jsonb', {nullable: true })
    public data: AnnotationData;

    @Column({ nullable: true })
    public comment: string;

    prototype(): AnnotationPrototype {
        return new AnnotationPrototype(this);
    }
}


export class AnnotationPrototype {
    public id: number;
    public image: ImagePrototype;
    public comment: string;
    public lastSubmissionEvent: SubmissionEventPrototype;
    public tasks: number[];

    constructor(annotation: Annotation) {
        this.id = annotation.id;
        this.image = annotation.image.prototype();
        this.comment = annotation.comment;
        this.lastSubmissionEvent = annotation.lastSubmissionEvent.prototype();
        this.tasks = annotation.tasks.map(t=>t.id);
    }
}
