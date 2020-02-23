import { Column, Entity, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { isNullOrUndefined } from 'util';

import { TaskType } from './taskType.model';
import { User } from './user.model';
import { Annotation } from './annotation.model';
import { IProtoTask } from '../prototypes/IProtoTask.interface';
import { ITask } from '../interfaces/ITask.interface';

@Entity()
export class Task {

    // Columns

    @PrimaryGeneratedColumn()
    public id: number;

    @Column()
    public taskTypeId: number;

    @Column()
    public annotationId: number;

    @Column({ default: true })
    public isVisible: boolean;

    @Column({ default: false })
    public isComplete: boolean;

    @Column({ default: '' })
    public comment: string;

    @Column({ nullable: true })
    public assignedUserId: number;

    @Column()
    public creatorId: number;

    @Column()
    public imageId: number;

    @Column()
    public projectId: number;

    // Relationships

    @ManyToOne(type => TaskType, taskType => taskType.tasks, { eager: true })
    public taskType: TaskType;

    @ManyToOne(type => Annotation, annotation => annotation.tasks, { eager: true })
    public annotation!: Annotation;

    @ManyToOne(type => User, user => user.assignedTasks, { nullable: true, eager: true })
    public assignedUser: User;

    @ManyToOne(type => User, user => user.createdTasks, { eager: true })
    public creator: User;

    public static fromInterface(itask: ITask): Task {
        const task = new Task();
        task.update(itask);
        if (!isNullOrUndefined(itask.id)) { task.id = itask.id; }
        if (!isNullOrUndefined(itask.creatorId))  { task.creatorId = itask.creatorId; }
        return task;
    }

    public interface(): ITask {
        return {
            id: this.id,
            taskTypeId: this.taskTypeId,
            annotationId: this.annotationId,
            isComplete: this.isComplete,
            isVisible: this.isVisible,
            comment: this.comment,
            assignedUserId: this.assignedUserId,
            creatorId: this.creatorId,
            imageId: this.imageId,
            projectId: this.projectId,
        };
    }

    public update(itask: ITask): void {
        if (!isNullOrUndefined(itask.taskTypeId)) {  this.taskTypeId = itask.taskTypeId; }
        if (!isNullOrUndefined(itask.annotationId)) { this.annotationId = itask.annotationId; }
        if (!isNullOrUndefined(itask.isComplete)) { this.isComplete = itask.isComplete; }
        if (!isNullOrUndefined(itask.isVisible)) { this.isVisible = itask.isVisible; }
        if (!isNullOrUndefined(itask.comment)) { this.comment = itask.comment; }
        if (!isNullOrUndefined(itask.assignedUserId)) { this.assignedUserId = itask.assignedUserId; }
    }

    public proto(): IProtoTask {
        return {
            id: this.id,
            taskType: this.taskType.proto(),
            annotation: this.annotation.proto(),
            isComplete: this.isComplete,
            isVisible: this.isVisible,
            comment: this.comment,
            assignedUser: !isNullOrUndefined(this.assignedUser) ? this.assignedUser.proto() : null,
            creator: this.creator.proto(),
            // image: this.imageId.proto(),
            // project: this.imageId.proto()

        };
    }
}
