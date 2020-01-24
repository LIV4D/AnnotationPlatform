import { IGalleryObject } from './galleryObject.interface';

export interface IGallery {
    objects: IGalleryObject[];
    objectCount: number;
}
