import { Column, Entity, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { isNullOrUndefined } from 'util';

import { TaskType, ProtoTaskType } from './taskType.model';
import { User, ProtoUser } from './user.model';
import { Annotation, ProtoAnnotation } from './annotation.model';

@Entity()
export class Task {
    @PrimaryGeneratedColumn()
    public id: number;

    @ManyToOne(type => TaskType, taskGroup => taskGroup.tasks, {eager: true})
    public type: TaskType;

    @Column({ nullable: true })
    public typeId: number;

    @ManyToOne(type => Annotation, annotation => annotation.tasks, {eager: true})
    public annotation!: Annotation;

    @Column({ nullable: true })
    public annotationId: number;

    @Column({ default: true })
    public isVisible: boolean;

    @Column({ default: false })
    public isComplete: boolean;

    @Column({ nullable: true })
    public comment: string;

    @ManyToOne(type => User, user => user.assignedTasks, { nullable: true, eager: true})
    public assignedUser: User;

    @Column({ nullable: true })
    public assignedUserId: number;

    @ManyToOne(type => User, user => user.createdTasks, {eager: true})
    public creator: User;

    @Column({ nullable: true })
    public creatorId: number;

    public interface(): ITask {
        return {
            id: this.id,
            typeId: this.typeId,
            annotationId: this.annotationId,
            isComplete: this.isComplete,
            isVisible: this.isVisible,
            comment: this.comment,
            assignedUserId: this.assignedUserId,
            creatorId: this.creatorId,
        };
    }

    public update(itask: ITask): void {
        if(!isNullOrUndefined(itask.typeId))         this.typeId = itask.typeId; 
        if(!isNullOrUndefined(itask.annotationId))   this.annotationId = itask.annotationId;
        if(!isNullOrUndefined(itask.isComplete))     this.isComplete = itask.isComplete;
        if(!isNullOrUndefined(itask.isVisible))      this.isVisible = itask.isVisible;
        if(!isNullOrUndefined(itask.comment))        this.comment = itask.comment;
        if(!isNullOrUndefined(itask.assignedUserId)) this.assignedUserId = itask.assignedUserId;
    }

    public static fromInterface(itask: ITask): Task {
        const task = new Task();
        task.update(itask);
        if(!isNullOrUndefined(itask.id))        task.id = itask.id;
        if(!isNullOrUndefined(itask.creatorId)) task.creatorId = itask.creatorId;
        return task;
    }

    public proto(): ProtoTask {
        return {
            id: this.id,
            type: this.type.proto(),
            annotation: this.annotation.proto(),
            isComplete: this.isComplete,
            isVisible: this.isVisible,
            comment: this.comment,
            assignedUser: !isNullOrUndefined(this.assignedUser) ? this.assignedUser.proto() : null,
            creator: this.creator.proto(),
        };
    }
}


export interface ITask {
    id?: number;
    typeId?: number;
    annotationId?: number;
    isComplete?: boolean;
    isVisible?: boolean;
    comment?: string;
    assignedUserId?: number;
    creatorId?: number;
}


export interface ProtoTask {
    id: number;
    type: ProtoTaskType;
    annotation: ProtoAnnotation;
    isComplete: boolean;
    isVisible: boolean;
    comment: string;
    assignedUser: ProtoUser;
    creator: ProtoUser;
}