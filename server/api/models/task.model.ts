import 'reflect-metadata';
import { Column, Entity, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { TaskType } from './taskType.model';
import { User } from './user.model';
import { Annotation } from './annotation.model';
import { Image } from './image.model';

import { isNullOrUndefined } from 'util';

@Entity()
export class Task {
    @PrimaryGeneratedColumn()
    public id: number;

    @ManyToOne(type => TaskType, taskGroup => taskGroup.tasks)
    public type: TaskType;

    @ManyToOne(type => Annotation, annotation => annotation.tasks, { nullable: true })
    public annotation!: Annotation;

    @ManyToOne(type => Image, image => image.tasks)
    public image: Image;

    @ManyToOne(type => User, user => user.tasks, { nullable: true })
    public user: User;

    @Column({ default: true })
    public isVisible: boolean;

    @Column({ default: false })
    public isComplete: boolean;

    @Column({ nullable: true })
    public comment: string;

    prototype(): TaskPrototype {
        return new TaskPrototype(this);
    }
}


export class TaskPrototype {
    public id: number;
    public type: string;
    public user: string;
    public annotationId: number;
    public imageId: number;
    public isComplete: boolean;
    public isVisible: boolean;
    public comment: string;
    
    constructor(task: Task) {
        this.id = task.id;
        this.type = task.type.title;
        this.user = !isNullOrUndefined(task.user) ? task.user.title() : null;
        this.annotationId = !isNullOrUndefined(task.annotation) ? task.annotation.id : null;
        this.imageId = !isNullOrUndefined(task.image) ? task.image.id : null;
        this.isComplete = task.isComplete;
        this.isVisible = task.isVisible;
        this.comment = task.comment;
    }
}