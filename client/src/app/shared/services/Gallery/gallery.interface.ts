import { IGalleryObject } from './gallery-object.interface';

export interface IGallery {
  objects: IGalleryObject[];
  objectCount: number;
}
