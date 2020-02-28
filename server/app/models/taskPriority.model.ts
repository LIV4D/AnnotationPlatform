import { Column, Entity, PrimaryColumn, OneToOne } from 'typeorm';
import { isNullOrUndefined } from 'util';

import { Task } from './task.model';
import { User } from './user.model';

@Entity()
export class TaskPriority {

    // Columns

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

    // public static fromInterface(itaskPriority: ITaskPriority): Task {
    //     const task = new Task();
    //     task.update(itask);
    //     if (!isNullOrUndefined(itask.id)) { task.id = itask.id; }
    //     if (!isNullOrUndefined(itask.creatorId))  { task.creatorId = itask.creatorId; }
    //     return task;
    // }

    // public interface(): ITask {
    //     return {
    //         id: this.id,
    //         taskTypeId: this.taskTypeId,
    //         annotationId: this.annotationId,
    //         isComplete: this.isComplete,
    //         isVisible: this.isVisible,
    //         comment: this.comment,
    //         assignedUserId: this.assignedUserId,
    //         creatorId: this.creatorId,
    //         imageId: this.imageId,
    //         projectId: this.projectId,
    //         lastModifiedTime: this.lastModifiedTime,
    //     };
    // }

    // public update(itask: ITask): void {
    //     if (!isNullOrUndefined(itask.taskTypeId)) {  this.taskTypeId = itask.taskTypeId; }
    //     if (!isNullOrUndefined(itask.annotationId)) { this.annotationId = itask.annotationId; }
    //     if (!isNullOrUndefined(itask.isComplete)) { this.isComplete = itask.isComplete; }
    //     if (!isNullOrUndefined(itask.isVisible)) { this.isVisible = itask.isVisible; }
    //     if (!isNullOrUndefined(itask.comment)) { this.comment = itask.comment; }
    //     if (!isNullOrUndefined(itask.assignedUserId)) { this.assignedUserId = itask.assignedUserId; }
    //     if (!isNullOrUndefined(itask.lastModifiedTime)) { this.lastModifiedTime = itask.lastModifiedTime; }
    // }

    // public proto(): IProtoTask {
    //     return {
    //         id: this.id,
    //         taskType: this.taskType.proto(),
    //         annotation: this.annotation.proto(),
    //         isComplete: this.isComplete,
    //         isVisible: this.isVisible,
    //         comment: this.comment,
    //         assignedUser: !isNullOrUndefined(this.assignedUser) ? this.assignedUser.proto() : null,
    //         creator: this.creator.proto(),
    //         // image: this.imageId.proto(),
    //         // project: this.imageId.proto()

    //     };
    // }
}
