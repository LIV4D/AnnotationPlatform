import { environment } from './../../environments/environment.prod';
import { AppService } from './../app.service';
import { LoginService } from './login.service';
import { ROUTES } from '../routes';
import { Router } from '@angular/router';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']
})

export class LoginComponent implements OnInit {
    formErrors = {
        'email': '',
        'password': '',
        'server': ''
    };

    validationMessages = {
        'email': {
            'required': 'Email required'
        },
        'password': {
            'required': 'Password required'
        }
    };

    public loginForm: FormGroup;
    public email: string;
    public password: string;

    constructor(private fb: FormBuilder, private router: Router, private loginService: LoginService, public appService: AppService) { }

    ngOnInit(): void {
        this.loginService.logout();
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
        if (!this.loginForm) { return; }
        const form = this.loginForm;
        for (const field in this.formErrors) {
            const control = form.get(field);
            this.formErrors[field] = '';
            if (control && control.dirty && !control.valid) {
                const messages = this.validationMessages[field];
                for (const key in control.errors) {
                    this.formErrors[field] += messages[key] + ' ';
                }
            }
        }
    }

    public login(): void {
        this.appService.loading = true;
        this.loginService.login(this.loginForm.value.email, this.loginForm.value.password)
            .subscribe(
            data => {
                this.appService.loading = false;
                this.router.navigate(['/' + ROUTES.GALLERY]);
            },
            error => {
                this.formErrors.server = error.error.message ? error.error.message : 'Unable to connect to server.';
                this.appService.loading = false;
            });
    }
}
