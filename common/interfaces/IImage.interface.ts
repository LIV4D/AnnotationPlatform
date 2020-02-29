import { Metadata } from '../../server/app/models/image.model';
export interface IImage {
    id?: number;
    type?: string;
    metadata?: Metadata;
    preprocessing?: boolean;
}
