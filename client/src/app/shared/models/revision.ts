import { isNullOrUndefined } from 'util';

export class Revision {
    biomarkers?: Array<Revision>;
    type?: string;
    color?: string;
    dataImage?: string; // ou string
}