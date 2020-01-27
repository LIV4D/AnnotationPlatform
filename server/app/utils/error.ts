import { ValidationError } from 'class-validator';

export function createError(errorMessage: string, status: number): Error {
    const error: any = new Error(errorMessage);
    error.status = status;
    return error;
}

export function createErrorFromvalidationErrors(validationErrors: ValidationError[]): Error {
    const errorMessages = validationErrors.map(validationError => {
        let errorMessage = '';
        for (const key of Object.keys(validationError.constraints)) {
            errorMessage += validationError.constraints[key];
        }
        return errorMessage;
    });
    return createError(errorMessages.reduce((message, errorMessage) => message + errorMessage), 409);
}
