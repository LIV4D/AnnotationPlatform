import { IProtoTaskType } from './IProtoTaskType.interface';
import { ProtoUser } from '../models/user.model';
import { IProtoAnnotation } from './IProtoAnnotation.interface';

export interface IProtoTask {
    id: number;
    taskType: IProtoTaskType;
    annotation: IProtoAnnotation;
    isComplete: boolean;
    isVisible: boolean;
    comment: string;
    assignedUser: ProtoUser;
    creator: ProtoUser;
}
