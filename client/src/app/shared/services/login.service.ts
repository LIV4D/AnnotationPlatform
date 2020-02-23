import { catchError, map } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';
import { HttpErrorResponse, HttpClient, HttpHeaders } from '@angular/common/http';
// import { Injectable } from '@angular/core';
import { AppService } from './app.service';
import { Router } from '@angular/router';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Injectable, Injector } from '@angular/core';

@Injectable()
export class LoginService {

  formErrors = {
    email: '',
    password: '',
    server: ''
  };

  public loginForm: FormGroup;
  // public _email: string;
  // public password: string;

  // tslint:disable-next-line:variable-name
  private _user: any;
  // tslint:disable-next-line:variable-name
  private _name: string;

  constructor(private http: HttpClient, private appService: AppService, private router: Router) { }

  get email(): string {
    return this._user ? this._user.user.email : null;
  }

  get name(): string {
    return this._user ? this._user.user.name : null;
  }

  login(email: string, password: string): Observable<any> {
    this._user = email;
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

  loginAppService(email: string, password: string) {
    this.appService.loading = true;
    this.login(email, password)
      .subscribe(
        data => {
          this.appService.loading = false;
          // Todo: Bring to tasks page only for clinician user
          this.router.navigate(['/tasks']);
        },
        error => {
          this.formErrors.server = error.error.message ? error.error.message : 'Unable to connect to server.';
          this.appService.loading = false;
        });
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
