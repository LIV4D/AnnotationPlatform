import 'reflect-metadata';
import { isNullOrUndefined } from 'util';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';

import { IWidget } from '../interfaces/IWidget.interface';
import { IProtoWidget } from '../prototype interfaces/IProtoWidget.interface';
import { TaskType } from './taskType.model';

export enum WidgetType {
    multiLine = 'multiLine',
    simpleLine = 'simpleLine',
    numerical = 'numerical',
    multiButton = 'multiButton',

}

@Entity()
export class Widget {
    @PrimaryGeneratedColumn('increment')
    public id: number;

    @Column()
    public taskTypeId: number;

    @Column({ type: 'text', default : WidgetType.simpleLine })
    public type: WidgetType;

    @Column({ length: 32, default: '' })
    public label: string;

    @Column({ length: 32, default: '' })
    public defaultEntryValue: string;

    @Column({ length: 254, default: '' })
    public entryField: string;

    @Column({ length: 32, default: '' , nullable: true })
    public validationRegex: string;


    @ManyToOne(type => TaskType, taskType => taskType.widgets)
    public assignedTaskType: TaskType;

    public static fromInterface(iWidget: IWidget): Widget {
        const u = new Widget();
        if (!isNullOrUndefined(iWidget.id)) { u.id = iWidget.id; }
        u.update(iWidget);
        return u;
    }

    public interface(): IWidget {
        return {
            id: this.id,
            taskTypeId: this.taskTypeId,
            label: this.label,
            defaultEntryValue: this.defaultEntryValue,
            entryField: this.entryField,
            validationRegex: this.validationRegex,
            type: this.type,
        };
    }

    public update(iwidget: IWidget) {
        if (!isNullOrUndefined(iwidget.taskTypeId)) {  this.taskTypeId = iwidget.taskTypeId; }
        if (!isNullOrUndefined(iwidget.label)) { this.label = iwidget.label; }
        if (!isNullOrUndefined(iwidget.entryField)) { this.entryField = iwidget.entryField; }
        if (!isNullOrUndefined(iwidget.validationRegex)) { this.validationRegex = iwidget.validationRegex; }
        if (!isNullOrUndefined(iwidget.type)) { this.type = iwidget.type; }
    }

    public proto(): IProtoWidget {
        return {
            id: this.id,
            taskTypeId: this.taskTypeId,
            label: this.label,
            entryField: this.entryField,
            defaultEntryValue: this.defaultEntryValue,
            validationRegex: this.validationRegex,
            type: this.type,
        };
    }
}
