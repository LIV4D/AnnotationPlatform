import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, OneToOne, BeforeInsert, OneToMany } from 'typeorm';
import { isNullOrUndefined } from 'util';

import { User } from './user.model';
import { Annotation } from './annotation.model';
import { IProtoSubmissionEvent } from '../prototype interfaces/IProtoSubmissionEvent.interface';
import { ISubmissionEvent } from '../../../common/interfaces/ISubmissionEvent.interface';

@Entity()
export class SubmissionEvent {
    @PrimaryGeneratedColumn('increment')
    public id: number;

    @Column({ default: '' })
    public description: string;

    @Column()
    public date: Date;

    @Column({ default: 0 })
    public timestamp: number;

    @ManyToOne(type => User, user => user.submissions, { eager: true })
    public user: User;

    @Column()
    public userId: number;

    @OneToOne(type => Annotation, annotation => annotation.submitEvent)
    public annotation: Annotation;

    @ManyToOne(type => SubmissionEvent, parentEvent => parentEvent.childEvents, { nullable: true })
    public parentEvent: SubmissionEvent;

    @Column({ nullable: true })
    public parentEventId: number;

    @OneToMany(type => SubmissionEvent, child => child.parentEvent)
    public childEvents: SubmissionEvent[];

    public static fromInterface(ievent: ISubmissionEvent): SubmissionEvent {
        const event = new SubmissionEvent();
        event.update(ievent);
        if (!isNullOrUndefined(ievent.id)) { event.id = ievent.id; }
        return event;
    }

    @BeforeInsert()
    setDate(): void {
        this.date =  new Date(Date.now());
    }

    public interface(): ISubmissionEvent {
        return {
            id: this.id,
            date: this.date,
            timestamp: this.timestamp,
            description: this.description,
            userId: this.userId,
            parentEventId: this.parentEventId,
        };
    }

    public update(ievent: ISubmissionEvent): void {
        if (!isNullOrUndefined(ievent.date)) {          this.date = ievent.date; }
        if (!isNullOrUndefined(ievent.timestamp)) {     this.timestamp = ievent.timestamp; }
        if (!isNullOrUndefined(ievent.description)) {   this.description = ievent.description; }
        if (!isNullOrUndefined(ievent.userId)) {        this.userId = ievent.userId; }
        if (!isNullOrUndefined(ievent.parentEventId)) { this.parentEventId = ievent.parentEventId; }
    }

    public proto(): IProtoSubmissionEvent {
        return {
            id: this.id,
            description: this.description,
            date: this.date,
            timestamp: this.timestamp,
            user: this.user.proto(),
            parentEventId: this.parentEventId,
        };
    }
}
