import { Component, OnInit } from '@angular/core';
import { LoginFacadeService } from './login.facade.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  isAuthenticated: boolean;

  constructor(private facadeService: LoginFacadeService) { }

  ngOnInit() {
    this.isAuthenticated = this.facadeService.isAuthenticated();
  }

}
