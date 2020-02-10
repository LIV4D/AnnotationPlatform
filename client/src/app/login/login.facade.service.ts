import { Injectable, Injector } from '@angular/core';
import { LoginService } from '../shared/services/login.service';
import { Observable } from 'rxjs';

@Injectable()
export class LoginFacadeService {

  /// LoginService wrapper
  // tslint:disable-next-line:variable-name
  private _loginService: LoginService;
  public get loginService(): LoginService {
    if (!this.loginService) {
      this._loginService = this.injector.get(LoginService);
    }
    return this.loginService;
  }
  /// ... add the other service wrappers

  constructor(private injector: Injector) {  }

  /// Login function wrapper
  isAuthenticated() {
    return this._loginService.isAuthenticated();
  }

  login(email: string, password: string): Observable<any> {
    return this._loginService.login(email, password);
  }

  loginAppService() {
    return this._loginService.loginAppService();
  }

  /// ... add the other functions for the other services

}
