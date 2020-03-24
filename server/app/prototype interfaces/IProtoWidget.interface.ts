import { WidgetType } from './../models/widget.model';
export interface IProtoWidget {
    id: number;
    taskTypeId: number;
    label: string;
    type: WidgetType;
    defaultEntryValue: string;
    validationRegex: string;
    entryField: string;
}
