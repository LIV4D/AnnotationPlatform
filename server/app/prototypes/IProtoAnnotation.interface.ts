import { ProtoImage } from '../models/image.model';
import { ProtoSubmissionEvent } from '../models/submissionEvent.model';
export interface IProtoAnnotation {
    id: number;
    image: ProtoImage;
    comment: string;
    submitEvent: ProtoSubmissionEvent;
}
