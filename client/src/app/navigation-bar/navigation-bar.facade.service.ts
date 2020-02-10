import { Injectable, Injector } from '@angular/core';

@Injectable()
export class NavigationBarFacadeService {

  /// NavBarService wrapper -- TODO: NavBarService is not created yet

  // private _navBarService: NavBarService;
  // public get navBarService(): NavBarService {
  //   if (!this._navBarService) {
  //     this._navBarService = this.injector.get(NavBarService);
  //   }
  //   return this._navBarService;
  // }
  /// ... add the other service wrappers

  constructor(private injector: Injector) {  }

  /// ... add the other functions for the other services

}
