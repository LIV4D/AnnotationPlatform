import { LoginService } from './login.service';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { BugtrackerComponent } from 'src/app/bugtracker/bugtracker.component';
import { isNullOrUndefined } from 'util';
import { ErrorMessageService, ErrorSeverity } from './errorMessage.service';


@Injectable()
export class BugtrackerService {

    // public isVisible = false;

    constructor(public loginService: LoginService, private errorMessage: ErrorMessageService,private http: HttpClient) {
    }

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
        console.log(body);
        this.http.post(`/api/bugtracker/create`, body).subscribe();

    }
}
