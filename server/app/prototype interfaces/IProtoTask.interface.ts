import { IProtoTaskType } from './IProtoTaskType.interface';
import { IProtoUser } from './IProtoUser.interface';
import { IProtoAnnotation } from './IProtoAnnotation.interface';

export interface IProtoTask {
    id: number;
    taskType: IProtoTaskType;
    annotation: IProtoAnnotation;
    isComplete: boolean;
    isVisible: boolean;
    comment: string;
    assignedUser: IProtoUser;
    creator: IProtoUser;
}
