import { Metadata } from '../models/image.model';
export interface IProtoImage {
    id: number;
    type: string;
    metadata: Metadata;
    preprocessing: boolean;
}
