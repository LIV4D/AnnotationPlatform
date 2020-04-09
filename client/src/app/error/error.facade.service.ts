import { Injectable } from '@angular/core';
import { LoginService } from '../shared/services/login.service';

@Injectable({
  providedIn: 'root'
})
export class ErrorFacadeService {

    constructor(private loginService: LoginService) { }

    public logout(){
        this.loginService.logout();
    }
}