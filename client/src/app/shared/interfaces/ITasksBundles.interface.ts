import { ITasks } from './ITasks.interface';

export interface ITasksBundles {
    primaryTaskType?: string;
    primaryTaskTypeDescription?: string;
    primaryBundle?: ITasks[];
    primaryBundleThumbnails?: string[];
    secondaryTaskType?: string;
    secondaryTaskTypeDescription?: string;
    secondaryBundle?: ITasks[];
    secondaryBundleThumbnails?: string[];
    tertiaryTaskType?: string;
    tertiaryTaskTypeDescription?: string;
    tertiaryBundle?: ITasks[];
    tertiaryBundleThumbnails?: string[];
}


