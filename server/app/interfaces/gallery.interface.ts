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
    id?: number;
    taskId?: number;
    isComplete?: boolean;
    isVisible?: boolean;
    thumbnail?: string;
    taskTypeId?: number;
    annotationId?: number;
    comment?: string;
    assignedUserId?: number;
    creatorId?: number;
    lastModifiedTime?: Date;
    projectTitle?: string;
}
