import { IProtoImage } from './IProtoImage.interface';
import { IProtoSubmissionEvent } from './IProtoSubmissionEvent.interface';
export interface IProtoAnnotation {
    id: number;
    image: IProtoImage;
    comments: string[];
    submitEvent: IProtoSubmissionEvent;
}
