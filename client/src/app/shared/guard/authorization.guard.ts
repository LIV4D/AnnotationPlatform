import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router, CanActivateChild } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthorizationService } from '../services/auth/authorization.service';

@Injectable({
  providedIn: 'root'
})
export class AuthorizationGuard implements CanActivate, CanActivateChild {

  constructor(private authorizationService: AuthorizationService, private router: Router) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    const authorizedRoles = next.data.authorizedRoles;
    const isAuthorized = this.authorizationService.isAuthorized(authorizedRoles);

    if (!isAuthorized) {
      this.router.navigate(['accessdenied']);
    }

    return isAuthorized;
  }

  canActivateChild(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    const authorizedRoles = next.data.authorizedRoles;
    const isAuthorized = this.authorizationService.isAuthorized(authorizedRoles);

    if (!isAuthorized) {
    this.router.navigate(['accessdenied']);
  }

    return isAuthorized;
  }

}
