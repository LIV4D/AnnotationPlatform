import {AnnotationData} from '../server/app/models/annotation.model';
import {Metadata} from '../server/app/models/image.model';

export interface IUser {
    id?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    isAdmin?: boolean;
    password?: string;
    salt?: string;
}

export interface ITaskType {
    id?: number;
    title?: string;
    description?: string;
}

export interface ITask {
    id?: number;
    isVisible?: boolean;
    isComplete?: boolean;
    comment?: string;
    userId?: number;
    imageId?: number;
    taskGroupId?: number;
    annotationId?: number;
}

export interface ITaskGallery {
    taskId: number;
    isComplete: boolean;
    thumbnail: string;
    taskGroupTitle: string;
    imageId: number;
 }

export interface IImage {
    id?: number;
    type?: string;
    metadata?: Metadata;
    preprocessing?: boolean;
}

export interface IAnnotation {
    id?: number;
    imageId?: number;
    data?: AnnotationData;
    comment?: string;
}

export interface IEvenement {
    id?: number;
    date?: string;
    timestamp?: number;
    description?: string;
    annotationId?: number;
    userId?: string;
}

export interface ISubmission {
    taskId: number;
    userId?: string; // user who submitted
    data?: AnnotationData;
    uptime?: number;
    comment?: string;
    isComplete?: boolean;
}