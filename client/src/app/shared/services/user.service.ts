// Services
import { HeaderService } from './header.service';

// Model
import { User } from '../models/user.model';

import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})

export class UserService {
  constructor(private http: HttpClient, private headerService: HeaderService) {}

  /**
   * Gets the list of all users
   */
  getUsers(): Observable<User[]> {
    const req = this.http.get<User[]>(`/api/users/list`, {observe: 'events', reportProgress: true});
    return this.headerService.display_progress(req, 'Downloading: Task Types List');
  }

  async getUsersApp() {
    const data = await this.getUsers().toPromise();
    return data as User[];
  }
}
