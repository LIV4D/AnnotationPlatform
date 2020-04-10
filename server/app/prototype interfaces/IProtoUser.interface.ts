import { UserRole } from './../models/user.model';

export interface IProtoUser {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    role: UserRole;
}
