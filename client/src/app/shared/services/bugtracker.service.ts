import { LoginService } from './login.service';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { BugtrackerComponent } from 'src/app/bugtracker/bugtracker.component';


@Injectable()
export class BugtrackerService {

    public isVisible = false;

    constructor(public loginService: LoginService, private http: HttpClient) {
    }

    getIsVisible(): boolean {
        return this.isVisible;
      }

    show(bugtrackerDialog: MatDialog): void {
          this.isVisible = true;
        }


    hide(): void {
        this.isVisible = false;
    }

    toggleVisible(bugtrackerDialog: MatDialog): void {
        if (this.isVisible) {
            this.hide();
        } else {
            this.show(bugtrackerDialog);
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
