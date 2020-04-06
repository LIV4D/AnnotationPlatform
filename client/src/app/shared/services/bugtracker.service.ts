import { LoginService } from './login.service';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { BugtrackerComponent } from 'src/app/bugtracker/bugtracker.component';
import { isNullOrUndefined } from 'util';


@Injectable()
export class BugtrackerService {

    // public isVisible = false;

    constructor(public loginService: LoginService, private http: HttpClient) {
    }

    send(description: string): void {
        const email = JSON.parse(localStorage.getItem('currentUser')).user.email;
        const body = {
            'description': description,
            'author': !isNullOrUndefined(email) ? email : 'unknown',
            'date': new Date(Date.now()).toLocaleString('en-GB', {timeZone: 'UTC'}).replace(',', ''),
        };
        console.log(body);
        this.http.post(`/api/bugtracker/create`, body).subscribe();

    }
}
