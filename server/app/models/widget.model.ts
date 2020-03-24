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
    public assignedTask: TaskType;

    public static fromInterface(iWidget: IWidget): Widget {
        const u = new Widget();
        if (!isNullOrUndefined(iWidget.id)) { u.id = iWidget.id; }
        u.update(iWidget);
        return u;
    }

    public interface(): IWidget {
        return {
            id: this.id,
            label: this.label,
            defaultEntryValue: this.defaultEntryValue,
            entryField: this.entryField,
            validationRegex: this.validationRegex,
            type: this.type,
        };
    }

    public update(iuser: IWidget) {
        if (!isNullOrUndefined(iuser.label)) { this.label = iuser.label; }
        if (!isNullOrUndefined(iuser.entryField)) { this.entryField = iuser.entryField; }
        if (!isNullOrUndefined(iuser.validationRegex)) { this.validationRegex = iuser.validationRegex; }
        if (!isNullOrUndefined(iuser.type)) { this.type = iuser.type; }
    }

    public proto(): IProtoWidget {
        return {
            id: this.id,
            label: this.label,
            entryField: this.entryField,
            defaultEntryValue: this.defaultEntryValue,
            validationRegex: this.validationRegex,
            type: this.type,
        };
    }
}
