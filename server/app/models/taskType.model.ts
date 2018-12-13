import 'reflect-metadata';
import { Column, Entity, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Task } from './task.model';

@Entity()
export class TaskType {
    @PrimaryGeneratedColumn()
    public id: number;

    @OneToMany(type => Task, task => task.taskType)
    public tasks: Task[];

    @Column({ length : 32, unique : true })
    public name: string;

    @Column()
    public description: string;
}
