export interface IUser {
    id?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    isAdmin?: boolean;
    password?: string;
    salt?: string;
}

export interface ITaskGroups {
    id?: number;
    title?: string;
    description?: string;
}

export interface ITask {
    id?: number;
    isVisible?: boolean;
    isComplete?: boolean;
    comment?: string;
    userId?: number;
    imageId?: number;
    taskGroupId?: number;
    annotationId?: number;
}

export interface ITaskGallery {
    taskId: number;
    isComplete: boolean;
    thumbnail: string;
    taskGroupTitle: string;
    imageId: number;
 }
 

export interface IImage {
    id?: number;
    filename?: string;
    type?: string;
    metadata?: string;
    path?: string;
    preprocessingPath?: string;
    thumbnail?: string;

}

export interface IAnnotation {
    id?: number;
    imageId?: number;
    data?: string;
    comment?: string;
}

export interface IEvenement {
    id?: number;
    date?: string;
    timestamp?: string;
    description?: string;
    annotationId?: number;
    userId?: string;
}

export interface ISubmission {
    taskId: number;
    userSubmitterId?: string; // user who submitted
    data?: string;
    uptime?: string;
    comment?: string;
    isComplete?: boolean;
}

export interface IDownloadedTask {
    image: string;
    preprocessing: string;
    data: string;
    metadata: string;
    comment: string;
}