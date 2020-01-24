export interface IGalleryObject {
    id: number; // id of image
    type: string;
    thumbnail: string; // thumbnail image
    metadata: {[key:string]: string | number | boolean}; // metadata of the image
}
