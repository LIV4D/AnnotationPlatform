export interface ITask {
    id?: number;
    taskTypeId?: number;
    annotationId?: number;
    isComplete?: boolean;
    isVisible?: boolean;
    comment?: string;
    assignedUserId?: number;
    creatorId?: number;
    imageId?: number;
    projectTitle?: string;
    lastModifiedTime?: Date;
}
