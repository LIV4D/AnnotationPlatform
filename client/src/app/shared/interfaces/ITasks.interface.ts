export interface ITasks {
    id?: number;
    taskTypeId?: number;
    annotationId?: number;
    isComplete?: boolean;
    isVisible?: boolean;
    comment?: string;
    assignedUserId?: number;
    creatorId?: number;
}
