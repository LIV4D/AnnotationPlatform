import { AnnotationData } from '../models/annotation.model';
export interface IAnnotation {
    id?: number;
    imageId?: number;
    data?: AnnotationData;
    comment?: string;
    submitEventId?: number;
}
