import { UserRole } from './../../../../../server/app/models/user.model';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthorizationService {

  constructor() {}

  isAuthorized(authorizedRoles: string[]): boolean {
    return true;
  //   // check if the list of allowed roles is empty, if empty, authorize the user to access the page
  //   if (authorizedRoles == null || authorizedRoles.length === 0) {
  //     return true;
  //   }

  //   // get role from local storage
  //   let role = '';
  //   try {
  //     role = JSON.parse(localStorage.getItem('currentUser')).user.role;
  //   } catch (error) {console.log(error); }


  // // check if the user roles is in the list of allowed roles, return true if allowed and false if not allowed

  //   return authorizedRoles.includes(role);
  }
}
