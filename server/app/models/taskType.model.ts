import { Column, Entity, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { isNullOrUndefined } from 'util';

import { Task } from './task.model';
import { IProtoTaskType } from '../prototype interfaces/IProtoTaskType.interface';
import { ITaskType } from '../interfaces/ITaskType.interface';
import { Widget } from './widget.model';

@Entity()
export class TaskType {
    @PrimaryGeneratedColumn()
    public id: number;

    @Column({ length : 32, unique : true })
    public title: string;

    @Column({ default: '' })
    public description: string;

    @OneToMany(type => Task, task => task.taskType)
    public tasks: Task[];

    @OneToMany(type => Widget, widget => widget.assignedTask)
    public widgets: Widget[];

    public static fromInterface(itype: ITaskType): TaskType {
        const type = new TaskType();
        if (!isNullOrUndefined(itype.id)) { type.id = itype.id; }
        type.update(itype);
        return type;
    }

    public interface(): ITaskType {
        return {
            id: this.id,
            title: this.title,
            description: this.description,
        };
    }

    public update(itype: ITaskType): void {
        if (!isNullOrUndefined(itype.title)) {       this.title = itype.title; }
        if (!isNullOrUndefined(itype.description)) { this.description = itype.description; }
    }

    public proto(): IProtoTaskType {
        return {
            id: this.id,
            title: this.title,
            description: this.description,
        };
    }
}
