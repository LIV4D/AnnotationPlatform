import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, OneToMany, JoinColumn, OneToOne } from 'typeorm';
import { isNullOrUndefined } from 'util';

import { Image, ProtoImage } from './image.model';
import { SubmissionEvent, ProtoSubmissionEvent } from './submissionEvent.model';
import { Task } from './task.model';

export class StringHierarchy { [key:string]: StringHierarchy | string}

export class AnnotationData {
    biomarker: {[key: string]: Buffer};
    hierarchy: StringHierarchy;
    nongraphic: {[key: string]: string | Boolean | Buffer | number}
}

@Entity()
export class Annotation {

    @PrimaryGeneratedColumn('increment')
    public id: number;

    @ManyToOne(type => Image, image => image.annotations, {eager: true})
    public image: Image;

    @Column()
    public imageId: number;

    @Column('jsonb')
    public data: AnnotationData;

    @Column({ default: '' })
    public comment: string;

    @OneToOne(type => SubmissionEvent, evenements => evenements.annotation, {eager: true})
    @JoinColumn()
    public submitEvent: SubmissionEvent;

    @Column()
    public submitEventId: number;

    @OneToMany(type => Task, tasks => tasks.annotation)
    public tasks: Task[];

    public interface(): IAnnotation {
        return {id: this.id,
                imageId: this.imageId,
                submitEventId: this.submitEventId,
                data: this.data,
                comment: this.comment};
    }

    public update(iannotation: IAnnotation): void {
        if(!isNullOrUndefined(iannotation.data))            this.data = iannotation.data;
        if(!isNullOrUndefined(iannotation.comment))         this.comment = iannotation.comment;
        if(!isNullOrUndefined(iannotation.submitEventId))  this.submitEventId = iannotation.submitEventId;
    } 

    public static fromInterface(iannotation: IAnnotation): Annotation {
        const a = new Annotation();
        if(!isNullOrUndefined(iannotation.id))             a.id = iannotation.id;
        if(!isNullOrUndefined(iannotation.imageId))        a.imageId = iannotation.imageId;
        a.update(iannotation);
        return a;
    }

    public proto(): ProtoAnnotation {
        return {id: this.id,
                image: this.image.proto(),
                comment: this.comment,
                submitEvent: this.submitEvent.proto(),
            };
    }
}


export interface IAnnotation {
    id?: number;
    imageId?: number;
    data?: AnnotationData;
    comment?: string;
    submitEventId?: number;
}


export interface ProtoAnnotation {
    id: number;
    image: ProtoImage;
    comment: string;
    submitEvent: ProtoSubmissionEvent;
}