import { Component, OnInit } from '@angular/core';
import { LoginFacadeService } from './login.facade.service';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';

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

  constructor(private fb: FormBuilder, private facadeService: LoginFacadeService, private router: Router) {
    this.buildForm();
  }

  buildForm(): void {
    this.loginForm = this.fb.group({
      email: [this.email, [
        Validators.required]],
      password: [this.password, [
        Validators.required]]
    });
    this.loginForm.valueChanges
      .subscribe(data => this.onValueChanged(data));

    this.onValueChanged();
  }

  onValueChanged(data?: any): void {
    console.log('test');
  }

  ngOnInit() {
    this.isAuthenticated = false;
  }

  public login() {
    // this.router.navigate(['/dashboard']);
    this.facadeService.loginAppService(this.loginForm.value.email, this.loginForm.value.password);
    this.isAuthenticated = this.facadeService.isAuthenticated();
    // console.log('allo');
  }

}
