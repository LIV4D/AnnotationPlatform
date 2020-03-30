import { WidgetType } from './../models/widget.model';
export interface IWidget {
    id?: number;
    annotationId?: number;
    label?: string;
    type?: WidgetType;
    defaultEntryValue?: string;
    validationRegex?: string;
    entryField?: string;
}
