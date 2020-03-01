import { Column, Entity, JoinColumn, Unique, PrimaryColumn, ManyToOne } from 'typeorm';
import { isNullOrUndefined } from 'util';

import { Task } from './task.model';
import { User } from './user.model';
import { ITaskPriority } from '../interfaces/ITaskPriority.interface';

@Entity()
@Unique(['taskId', 'userId'])
export class TaskPriority {

    // Columns

    // @PrimaryGeneratedColumn()
    // public id: number;

    @PrimaryColumn()
    public taskId: number;

    @PrimaryColumn()
    public userId: number;

    @Column()
    public priority: number;

    // Relationships

    @ManyToOne(type => User, user => user.id, { eager: true })
    @JoinColumn()
    public user: User;

    @ManyToOne(type => Task, task => task.id, { eager: true })
    @JoinColumn()
    public task: Task;

    public static fromInterface(itaskPriority: ITaskPriority): TaskPriority {
        const taskPriority = new TaskPriority();
        taskPriority.update(itaskPriority);
        return taskPriority;
    }

    public interface(): ITaskPriority {
        return {
            // id: this.id,
            userId: this.userId,
            taskId: this.taskId,
            priority: this.priority,
        };
    }

    public update(itaskPriority: ITaskPriority): void {
        // if (!isNullOrUndefined(itaskPriority.id)) { this.id = itaskPriority.id; }
        if (!isNullOrUndefined(itaskPriority.taskId)) { this.taskId = itaskPriority.taskId; }
        if (!isNullOrUndefined(itaskPriority.userId))  { this.userId = itaskPriority.userId; }
        if (!isNullOrUndefined(itaskPriority.priority)) { this.priority = itaskPriority.priority; }
    }

}
