import { Metadata } from '..//models/image.model';
export interface IImage {
    id?: number;
    type?: string;
    metadata?: Metadata;
    preprocessing?: boolean;
}
