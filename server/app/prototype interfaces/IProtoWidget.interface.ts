import { WidgetType } from './../models/widget.model';
export interface IProtoWidget {
    id: number;
    label: string;
    type: WidgetType;
    validationRegex: string;
    entryField: string;
}
