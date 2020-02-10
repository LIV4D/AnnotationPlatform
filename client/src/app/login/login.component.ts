import { Component, OnInit } from '@angular/core';
import { LoginFacadeService } from './login.facade.service';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  public loginForm: FormGroup;
  public email: string;
  public password: string;

  formErrors = {
    email: '',
    password: '',
    server: ''
  };

  validationMessages = {
    email: {
      required: 'Email required'
    },
    password: {
      required: 'Password required'
    }
  };

  isAuthenticated: boolean;

  constructor(private facadeService: LoginFacadeService) { }

  ngOnInit() {
    this.isAuthenticated = this.facadeService.isAuthenticated();
  }

  public login(): void {
    this.facadeService.loginAppService();
  }

}
