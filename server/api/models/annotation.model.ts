import 'reflect-metadata';
import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, OneToMany, JoinColumn, OneToOne } from 'typeorm';
import { Image, ImagePrototype } from './image.model';
import { SubmissionEvent, SubmissionEventPrototype } from './submissionEvent.model';
import { Task } from './task.model';

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


export class AnnotationData {
    [key: string]: string | number | boolean | Buffer;
}


export class AnnotationPrototype {
    public id: number;
    public image: ImagePrototype;
    public comment: string;
    public lastSubmissionEvent: SubmissionEventPrototype;
    public tasksId: number[];

    constructor(annotation: Annotation) {
        this.id = annotation.id;
        this.image = annotation.image.prototype();
        this.comment = annotation.comment;
        this.lastSubmissionEvent = annotation.lastSubmissionEvent.prototype();
        this.tasksId = annotation.tasks.map(t=>t.id);
    }
}
