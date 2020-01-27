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

    public prototype(): TaskTypePrototype {
        return new TaskTypePrototype(this);
    }
}


export class TaskTypePrototype {
    public id: number;
    public tasks: number[];
    public title: string;
    public description: string;

    constructor(taskType: TaskType){
        this.id = taskType.id;
        this.tasks = taskType.tasks.map(t=>t.id);
        this.title = taskType.title;
        this.description = taskType.description;
    }
}