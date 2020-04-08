// Services
import { HeaderService } from './header.service';

// Model
import { User } from '../models/serverModels/user.model';

import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { catchError } from 'rxjs/operators';
import { ErrorMessageService } from './errorMessage.service';

@Injectable({
    providedIn: 'root'
})

export class UserService {
  constructor(private http: HttpClient, private headerService: HeaderService, private errorMessage: ErrorMessageService) {}

  /**
   * Gets the list of all users
   */
  getUsers(): Observable<User[]> {
    const req = this.http.get<User[]>(`/api/users/list`, {observe: 'events', reportProgress: true});
    return this.headerService.display_progress(req.pipe(catchError(x => this.errorMessage.handleServerError(x))), 'Downloading: Task Types List');
  }

  async getUsersApp() {
    const data = await this.getUsers().toPromise();
    return data as User[];
  }
}
