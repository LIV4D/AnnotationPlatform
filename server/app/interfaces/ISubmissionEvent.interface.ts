export interface ISubmissionEvent {
    id?: number;
    date?: Date;
    timestamp?: number;
    description?: string;
    userId?: number;
    parentEventId?: number;
}
