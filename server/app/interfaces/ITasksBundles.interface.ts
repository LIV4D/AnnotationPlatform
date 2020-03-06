import { Task } from '../models/task.model';

export interface ITasksBundles {
    primaryTaskType?: string;
    primaryTaskTypeDescription?: string;
    primaryBundle?: Task[];
    secondaryTaskType?: string;
    secondaryTaskTypeDescription?: string;
    secondaryBundle?: Task[];
    tertiaryTaskType?: string;
    tertiaryTaskTypeDescription?: string;
    tertiaryBundle?: Task[];
}
