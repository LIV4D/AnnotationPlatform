import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, OneToMany, JoinColumn, OneToOne } from 'typeorm';
import { isNullOrUndefined } from 'util';

import { Image } from './image.model';
import { SubmissionEvent } from './submissionEvent.model';
import { Task } from './task.model';
import { IProtoAnnotation } from '../prototype interfaces/IProtoAnnotation.interface';
import { IAnnotation } from '../../../common/interfaces/IAnnotation.interface';

export class StringHierarchy { [key: string]: StringHierarchy | string}

// tslint:disable-next-line:max-classes-per-file
export class AnnotationData {
    biomarker: {[key: string]: Buffer};
    hierarchy: StringHierarchy;
    nongraphic: {[key: string]: string | boolean | Buffer | number};
}

// tslint:disable-next-line:max-classes-per-file
@Entity()
export class Annotation {

    @PrimaryGeneratedColumn('increment')
    public id: number;

    @ManyToOne(type => Image, image => image.annotations, { eager: true })
    public image: Image;

    @Column()
    public imageId: number;

    @Column('jsonb')
    public data: AnnotationData;

    @Column({ default: '' })
    public comment: string;

    @OneToOne(type => SubmissionEvent, event => event.annotation, { eager: true })
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
        if (!isNullOrUndefined(iannotation.data)) { this.data = iannotation.data; }
        if (!isNullOrUndefined(iannotation.comment)) { this.comment = iannotation.comment; }
        if (!isNullOrUndefined(iannotation.submitEventId)) { this.submitEventId = iannotation.submitEventId; }
    }

    // tslint:disable-next-line:member-ordering
    public static fromInterface(iannotation: IAnnotation): Annotation {
        const a = new Annotation();
        if (!isNullOrUndefined(iannotation.id)) { a.id = iannotation.id; }
        if (!isNullOrUndefined(iannotation.imageId)) { a.imageId = iannotation.imageId; }
        a.update(iannotation);
        return a;
    }

    public proto(): IProtoAnnotation {
        return {id: this.id,
                image: this.image.proto(),
                comment: this.comment,
                submitEvent: this.submitEvent.proto(),
            };
    }
}
