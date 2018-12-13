import 'reflect-metadata';
import { Column, Entity, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Image } from './image.model';
import { TaskType } from './taskType.model';
import { User } from './user.model';

@Entity()
export class Task {
    @PrimaryGeneratedColumn()
    public id: number;

    @ManyToOne(type => Image, image => image.tasks)
    public image: Image;

    @ManyToOne(type => TaskType, taskType => taskType.tasks)
    public taskType: TaskType;

    @ManyToOne(type => User, user => user.tasks)
    public user: User;

    @Column()
    public active: boolean;

    @Column()
    public completed: boolean;
}
