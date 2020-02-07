import { Injectable, Injector } from '@angular/core';
import { LoginService } from '../shared/services/login.service';

@Injectable()
export class NavigationBarFacadeService {

  /// NavBarService wrapper
  private _navBarService: LoginService;
  public get navBarService(): LoginService {
    if (!this._navBarService) {
      this._navBarService = this.injector.get(LoginService);
    }
    return this._navBarService;
  }
  /// ... add the other service wrappers

  constructor(private injector: Injector) {  }

  /// ... add the other functions for the other services

}
