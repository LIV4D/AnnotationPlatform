import 'reflect-metadata';
import { isNullOrUndefined } from 'util';
import { Column, Entity, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';

import { IWidget } from '../interfaces/IWidget.interface';
import { IProtoWidget } from '../prototype interfaces/IProtoWidget.interface';
import { Annotation } from './annotation.model';

export enum WidgetType {
    multiLine = 'multiLine',
    singleLine = 'singleLine',
    numerical = 'numerical',
    multiButton = 'multiButton',

}

@Entity()
export class Widget {
    @PrimaryGeneratedColumn('increment')
    public id: number;

    @Column()
    public annotationId: number;

    @Column({ type: 'text', default : WidgetType.singleLine })
    public type: WidgetType;

    @Column({ length: 32, default: '' })
    public label: string;

    @Column({ length: 32, default: '' })
    public defaultEntryValue: string;

    @Column({ length: 254, default: '' })
    public entryField: string;

    @Column({ length: 32, default: '' , nullable: true })
    public validationRegex: string;

    @ManyToOne(type => Annotation, annotation => annotation.widgets)
    public assignedAnnotation: Annotation;

    public static fromInterface(iWidget: IWidget): Widget {
        const u = new Widget();
        if (!isNullOrUndefined(iWidget.id)) { u.id = iWidget.id; }
        u.update(iWidget);
        return u;
    }

    public interface(): IWidget {
        return {
            id: this.id,
            annotationId: this.annotationId,
            label: this.label,
            defaultEntryValue: this.defaultEntryValue,
            entryField: this.entryField,
            validationRegex: this.validationRegex,
            type: this.type,
        };
    }

    public update(iwidget: IWidget) {
        if (!isNullOrUndefined(iwidget.annotationId)) {  this.annotationId = iwidget.annotationId; }
        if (!isNullOrUndefined(iwidget.label)) { this.label = iwidget.label; }
        if (!isNullOrUndefined(iwidget.entryField)) { this.entryField = iwidget.entryField; }
        if (!isNullOrUndefined(iwidget.validationRegex)) { this.validationRegex = iwidget.validationRegex; }
        if (!isNullOrUndefined(iwidget.type)) { this.type = iwidget.type; }
    }

    public proto(): IProtoWidget {
        return {
            id: this.id,
            annotationId: this.annotationId,
            label: this.label,
            entryField: this.entryField,
            defaultEntryValue: this.defaultEntryValue,
            validationRegex: this.validationRegex,
            type: this.type,
        };
    }
}