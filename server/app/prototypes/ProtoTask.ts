import { ProtoTaskType } from '../models/taskType.model';
import { ProtoUser } from '../models/user.model';
import { ProtoAnnotation } from '../models/annotation.model';

export interface ProtoTask {
    id: number;
    taskType: ProtoTaskType;
    annotation: ProtoAnnotation;
    isComplete: boolean;
    isVisible: boolean;
    comment: string;
    assignedUser: ProtoUser;
    creator: ProtoUser;
}
