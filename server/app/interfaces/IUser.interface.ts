import { UserRole } from './../models/user.model';
export interface IUser {
    id?: number;
    firstName?: string;
    lastName?: string;
    email?: string;
    role?: UserRole;
    password?: string;
}
