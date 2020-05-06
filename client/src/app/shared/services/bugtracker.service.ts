import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { isNullOrUndefined } from 'util';
import { ErrorMessageService, ErrorSeverity } from './error-message.service';
import { catchError } from 'rxjs/operators';
import { LoginService } from './auth/login.service';

/**
 * Bugtracker service sends bug info to server
 */
@Injectable()
export class BugtrackerService {


    constructor(public loginService: LoginService, private errorMessage: ErrorMessageService, private http: HttpClient) {
    }

    /**
     * posts bug info to server
     * @param description: description entered by user in bugtracker dialog
     */
    send(description: string): void {
        let email: string;
        try {
            email = JSON.parse(localStorage.getItem('currentUser')).user.email;
        } catch (error) {
            this.errorMessage.handleStorageError(error as Error, ErrorSeverity.critical);
        }
        const body = {
            description,
            author: !isNullOrUndefined(email) ? email : 'unknown',
            date: new Date(Date.now()).toLocaleString('en-GB', {timeZone: 'UTC'}).replace(',', ''),
        };
        this.http.post(`/api/bugtracker/create`, body).pipe(catchError(x => this.errorMessage.handleServerError(x))).subscribe();

    }
}
