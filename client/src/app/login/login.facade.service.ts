import { Injectable, Injector } from '@angular/core';
import { LoginService } from '../shared/services/login.service';
import { Observable } from 'rxjs';

@Injectable()
export class LoginFacadeService {

  /// LoginService wrapper
  // tslint:disable-next-line:variable-name
  /// ... add the other service wrappers

  constructor(private loginService: LoginService) {  }

  /// Login function wrapper
  isAuthenticated() {
    return this.loginService.isAuthenticated();
  }

  // async login(email: string, password: string): Promise<Observable<any>> {
  //   return this._loginService.login(email, password);
  // }

  loginAppService(email: string, password: string) {
    this.loginService.loginAppService(email, password);
  }

  /// ... add the other functions for the other services

}
