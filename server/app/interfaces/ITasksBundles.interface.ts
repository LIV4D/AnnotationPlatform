import { Task } from '../models/task.model';

export interface ITasksBundles {
    primaryTaskType?: string;
    primaryTaskTypeDescription?: string;
    primaryBundle?: Task[];
    primaryBundleThumbnails?: string[];
    secondaryTaskType?: string;
    secondaryTaskTypeDescription?: string;
    secondaryBundle?: Task[];
    secondaryBundleThumbnails?: string[];
    tertiaryTaskType?: string;
    tertiaryTaskTypeDescription?: string;
    tertiaryBundle?: Task[];
    tertiaryBundleThumbnails?: string[];
}
