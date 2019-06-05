import 'reflect-metadata';
import { Column, Entity, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
// import { Image } from './image.model';
import { TaskGroup } from './taskGroup.model';
import { User } from './user.model';
import { TaskPrototype } from './taskPrototype.model';
import { Annotation } from './annotation.model';
import { Image } from './image.model';

@Entity()
export class Task {
    @PrimaryGeneratedColumn()
    public id: number;

    @ManyToOne(type => TaskGroup, taskGroup => taskGroup.tasks)
    public taskGroup: TaskGroup;

    @ManyToOne(type => Annotation, annotation => annotation.tasks)
    public annotation: Annotation;

    @ManyToOne(type => Image, image => image.tasks)
    public image: Image;

    @ManyToOne(type => User, user => user.tasks)
    public user: User;

    @Column({ default: true })
    public isVisible: boolean;

    @Column({ default: false })
    public isComplete: boolean;

    @Column()
    public comment: string;

    prototype(): TaskPrototype {
        return new TaskPrototype(this);
    }
}
