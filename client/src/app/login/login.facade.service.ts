import { Injectable, Injector } from '@angular/core';
import { LoginService } from '../shared/services/login.service';

@Injectable()
export class LoginFacadeService {

  /// LoginService wrapper
  private _loginService: LoginService;
  public get loginService(): LoginService {
    if (!this._loginService) {
      this._loginService = this.injector.get(LoginService);
    }
    return this._loginService;
  }
  /// ... add the other service wrappers

  constructor(private injector: Injector) {  }

  /// Login function wrapper
  isAuthenticated() {
    return this.loginService.isAuthenticated();
  }

  /// ... add the other functions for the other services

}
