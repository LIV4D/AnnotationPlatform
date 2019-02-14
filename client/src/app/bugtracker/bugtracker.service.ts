import { Injectable } from '@angular/core';
import { LoginService } from '../login/login.service';
import { HttpClient } from '@angular/common/http';


@Injectable()
export class BugtrackerService {

    public isVisible = false;

    constructor(public loginService: LoginService, private http: HttpClient) {
    }

    show(): void {
        this.isVisible = true;
    }

    hide(): void {
        this.isVisible = false;
    }

    toggleVisible(): void {
        if (this.isVisible) {
            this.hide();
        } else {
            this.show();
        }
    }

    send(description: string): void {
        const body = {
            'description': description,
            'author': this.loginService.name !== null ? this.loginService.name : 'unknown',
            'date': new Date(Date.now()).toLocaleString('en-GB', {timeZone: 'UTC'}).replace(',', ''),
        };

        this.http.post(`/api/bugtracker`, body).subscribe();

    }
}
