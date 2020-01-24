import 'reflect-metadata';
import { Column, Entity, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Task } from './task.model';

@Entity()
export class TaskType {
    @PrimaryGeneratedColumn()
    public id: number;

    @OneToMany(type => Task, task => task.type)
    public tasks: Task[];

    @Column({ length : 32, unique : true })
    public title: string;

    @Column({ nullable: false })
    public description: string;
}
