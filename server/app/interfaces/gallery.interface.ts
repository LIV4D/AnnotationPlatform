export interface IGalleryObject {
    id: number; // id of image
    type: string;
    thumbnail: string; // thumbnail image
    metadata: {[key: string]: string | number | boolean}; // metadata of the image
}

export interface IGallery {
    objects: IGalleryObject[];
    objectCount: number;
}

export interface ITaskGallery {
    taskId: number;
    isComplete: boolean;
    thumbnail: string;
    taskTypeTitle: string;
    imageId: number;
}
