import { IProtoImage } from './IProtoImage';
import { IProtoSubmissionEvent } from './IProtoSubmissionEvent.interface';
export interface IProtoAnnotation {
    id: number;
    image: IProtoImage;
    comment: string;
    submitEvent: IProtoSubmissionEvent;
}
