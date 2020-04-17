import { Column, Entity, JoinColumn, Unique, PrimaryColumn, ManyToOne } from 'typeorm';
import { isNullOrUndefined } from 'util';

import { Task } from './task.model';
import { User } from './user.model';
import { ITaskPriority } from '../interfaces/ITaskPriority.interface';

/**
 * A task priority is used in order to create bundles of tasks.
 *
 * Any task can be assigned a task priority.
 * In which case, a user-task pair is created with a relative priority value. These values are then shunted
 * into an algorithm in order to create bundles which will be displayed to the user.
 *
 * Later, when a user has selected a bundle, the task priority will be deleted and
 * all tasks within the bundle will eb assigned to the user.
 */
@Entity()
@Unique(['taskId', 'userId'])
export class TaskPriority {

    // Columns

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
            userId: this.userId,
            taskId: this.taskId,
            priority: this.priority,
        };
    }

    public update(itaskPriority: ITaskPriority): void {
        if (!isNullOrUndefined(itaskPriority.taskId)) { this.taskId = itaskPriority.taskId; }
        if (!isNullOrUndefined(itaskPriority.userId))  { this.userId = itaskPriority.userId; }
        if (!isNullOrUndefined(itaskPriority.priority)) { this.priority = itaskPriority.priority; }
    }

}
