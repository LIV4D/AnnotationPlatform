import { IProtoImage } from './IProtoImage';
import { ProtoSubmissionEvent } from '../models/submissionEvent.model';
export interface IProtoAnnotation {
    id: number;
    image: IProtoImage;
    comment: string;
    submitEvent: ProtoSubmissionEvent;
}
