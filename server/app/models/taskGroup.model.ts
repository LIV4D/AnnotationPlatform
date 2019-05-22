import 'reflect-metadata';
import { Column, Entity, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Task } from './task.model';

@Entity()
export class TaskGroup {
    @PrimaryGeneratedColumn()
    public id: number;

    @OneToMany(type => Task, task => task.taskGroup)
    public tasks: Task[];

    @Column({ length : 32, unique : true })
    public title: string;

    // TODO: should description be a JSON to show a task tree (sub categories of tasks)?
    @Column({ nullable: false })
    public description: JSON;
}
