import 'reflect-metadata';
import { Column, Entity, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Image } from './image.model';
import { TaskGroup } from './taskGroup.model';
import { User } from './user.model';
import { TaskPrototype } from './taskPrototype.model';

@Entity()
export class Task {
    @PrimaryGeneratedColumn()
    public id: number;

    @ManyToOne(type => Image, image => image.tasks)
    public image: Image;

    @ManyToOne(type => TaskGroup, taskGroup => TaskGroup.tasks)
    public taskGroup: TaskGroup;

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
