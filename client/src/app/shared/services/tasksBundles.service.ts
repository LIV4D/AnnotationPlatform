
// Components

// Services
import { HeaderService } from './header.service';
import { AppService } from './app.service';

// Interfaces
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';


@Injectable()
export class TasksBundlesService {
  constructor(private http: HttpClient, private headerService: HeaderService, private appService: AppService) {}


}
