import { ITasks } from './ITasks.interface';

export interface ITasksBundles {
    primaryTaskType?: string;
    primaryTaskTypeDescription?: string;
    primaryBundle?: ITasks[];
    secondaryTaskType?: string;
    secondaryTaskTypeDescription?: string;
    secondaryBundle?: ITasks[];
    tertiaryTaskType?: string;
    tertiaryTaskTypeDescription?: string;
    tertiaryBundle?: ITasks[];
}

