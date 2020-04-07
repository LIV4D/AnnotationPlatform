import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { isNullOrUndefined } from 'util';

/**
 * Bugtracker service sends bug info to server
 */
@Injectable()
export class BugtrackerService {


    constructor(private http: HttpClient) {
    }

    /**
     * posts bug info to server
     * @param description: description entered by user in bugtracker dialog
     */
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
