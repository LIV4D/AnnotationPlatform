import { IProtoUser } from './IProtoUser.interface';
export interface IProtoSubmissionEvent {
    id: number;
    description: string;
    date: Date;
    timestamp: number;
    user: IProtoUser;
    parentEventId: number;
}
