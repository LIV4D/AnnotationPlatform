import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, OneToMany, JoinColumn, OneToOne } from 'typeorm';
import { isNullOrUndefined } from 'util';

import { Image } from './image.model';
import { SubmissionEvent } from './submissionEvent.model';
import { Task } from './task.model';
import { IProtoAnnotation } from '../prototype interfaces/IProtoAnnotation.interface';
import { IAnnotation } from '../interfaces/IAnnotation.interface';
import { Widget } from './widget.model';

// tslint:disable-next-line:max-classes-per-file
export class AnnotationData {
    biomarkers?: AnnotationData[];
    type?: string;
    color?: string;
    dataImage?: string; // ou string
}
/**
 * An annotation is the persistent data where an image is being annotated with ist different biomarkers.
 * Thus, it contains all the pertinent info for studying a retinian image.
 *
 * It can be associated with any number of tasks in order to be further annotated (OneToMany) and it can have any number of
 * widgets for further information gathering (OneToMany).
 *
 * It also has a number of submission events since each time an annotation is completed or worked upon,
 * a submission event is created (OneToOne).
 */
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

    @OneToMany(type => Widget, widget => widget.annotation, { eager: false, nullable: true })
    public widgets: Widget;

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
