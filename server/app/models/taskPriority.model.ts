import { Column, Entity, PrimaryColumn, OneToOne } from 'typeorm';
import { isNullOrUndefined } from 'util';

import { Task } from './task.model';
import { User } from './user.model';
import { ITaskPriority } from '../interfaces/ITaskPriority.interface';

@Entity()
export class TaskPriority {

    // Columnss

    @PrimaryColumn()
    public taskId: number;

    @PrimaryColumn()
    public userId: number;

    @Column()
    public priority: number;

    // Relationships

    @OneToOne(type => User, user => user.id, { eager: true })
    public user: User;

    @OneToOne(type => Task, task => task.id, { eager: true })
    public task: Task;

    public static fromInterface(itaskPriority: ITaskPriority): TaskPriority {
        const taskPriority = new TaskPriority();
        taskPriority.update(itaskPriority);
        if (!isNullOrUndefined(itaskPriority.taskId)) { taskPriority.taskId = itaskPriority.taskId; }
        if (!isNullOrUndefined(itaskPriority.userId))  { taskPriority.userId = itaskPriority.userId; }
        return taskPriority;
    }

    public interface(): ITaskPriority {
        return {
            userId: this.userId,
            taskId: this.taskId,
            priority: this.priority,
        };
    }

    public update(itask: ITaskPriority): void {
        if (!isNullOrUndefined(itask.priority)) { this.priority = itask.priority; }
    }

}
