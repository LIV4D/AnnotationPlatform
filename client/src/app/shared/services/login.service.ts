import { catchError, map } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';
import { HttpErrorResponse, HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable()
export class LoginService {

  // tslint:disable-next-line:variable-name
  private _user: any;
  // tslint:disable-next-line:variable-name
  private _name: string;

  constructor(private http: HttpClient) { }

  get email(): string {
    return this._user ? this._user.user.email : null;
  }

  get name(): string {
    return this._user ? this._user.user.name : null;
  }

  login(email: string, password: string): Observable<any> {
    this._user = null;
    const pw = password;
    return this.http.post<any>('/auth/login', { username: email, password: pw }).
      pipe(
        map((user: any) => {
          // login successful if there's a jwt token in the response
          if (user && user.token) {
            // store user details and jwt token in local storage to keep user logged in between page refreshes
            localStorage.setItem('currentUser', JSON.stringify(user));
          }
          this._user = user;
          return user;
        }));
  }

  isAuthenticated(): boolean {
    const userStr = localStorage.getItem('currentUser');
    if (!userStr) {
      return false;
    }
    if (!this._user) {
      this._user = JSON.parse(localStorage.getItem('currentUser'));
    }
    return true;
  }

  logout(): void {
    // remove user from local storage to log user out
    localStorage.removeItem('currentUser');
    this._user = null;
  }

  // isAuthenticated() {
  //   return true;
  // }
}
