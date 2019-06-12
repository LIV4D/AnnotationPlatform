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