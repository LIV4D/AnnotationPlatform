import { IProtoTaskType } from './ProtoTaskType.interface';
import { ProtoUser } from '../models/user.model';
import { ProtoAnnotation } from '../models/annotation.model';

export interface IProtoTask {
    id: number;
    taskType: IProtoTaskType;
    annotation: ProtoAnnotation;
    isComplete: boolean;
    isVisible: boolean;
    comment: string;
    assignedUser: ProtoUser;
    creator: ProtoUser;
}
