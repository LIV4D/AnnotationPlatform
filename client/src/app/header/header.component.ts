import { ROUTES } from './../routes';
import { Router } from '@angular/router';
import { LoginService } from './../login/login.service';
import { Component } from '@angular/core';
import * as screenfull from 'screenfull';
import { BugtrackerService } from '../bugtracker/bugtracker.service';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss']
})
export class HeaderComponent {

    constructor(private loginService: LoginService, private router: Router, private bugtrackerService: BugtrackerService) { }

    goToEditor(): void {
        this.router.navigate(['/' + ROUTES.EDITOR]);
    }

    goToGallery(): void {
        this.router.navigate(['/' + ROUTES.GALLERY]);
    }

    goToTasks(): void {
        this.router.navigate(['/' + ROUTES.TASKS]);
    }

    toggleFullScreen(): void {
        const fullscreenIcon = document.getElementById('fullscreenIcon');
        if (screenfull.enabled) {
            fullscreenIcon.innerHTML =  'fullscreen_exit';
        } else {
            fullscreenIcon.innerHTML =  'fullscreen';
        }
        screenfull.toggle();
    }

    logout(): void {
        this.loginService.logout();
        this.router.navigate(['/' + ROUTES.LOGIN]);
    }

    toggleBugtracker(): void {
        this.bugtrackerService.toggleVisible();
    }
}
