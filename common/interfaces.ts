import {AnnotationData} from '../server/app/models/annotation.model';


export interface ISubmission {
    taskId: number;
    data: AnnotationData;
    uptime: number;
    isComplete: boolean;
}