import { AnnotationData } from '../models/annotation.model';
export interface IAnnotation {
    id?: number;
    imageId?: number;
    data?: AnnotationData;
    comments?: string[];
    submitEventId?: number;
}
