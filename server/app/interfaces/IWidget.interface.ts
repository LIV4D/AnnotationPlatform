import { WidgetType } from './../models/widget.model';
export interface IWidget {
    id?: number;
    label?: string;
    type?: WidgetType;
    validationRegex?: string;
    entryField?: string;
}
