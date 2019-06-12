export interface IUser {
    id?: string;
    firstName: string;
    lastName: string;
    email?: string;
    isAdmin: boolean;
    password: string;
    salt?: string;
}

export interface ITaskGroups {
    id?: number;
    title: string;
    description: string;
}

export interface ITask {
    id?: number;
    isVisible: boolean;
    isComplete: boolean;
    comment: string;
    userId: number;
    imageId: number;
    taskGroupId: number;
    annotationId: number;
}