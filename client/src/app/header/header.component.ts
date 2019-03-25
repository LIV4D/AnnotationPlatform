import { ROUTES } from './../routes';
import { Router } from '@angular/router';
import { LoginService } from './../login/login.service';
import { Component } from '@angular/core';
import * as screenfull from 'screenfull';
import { BugtrackerService } from '../bugtracker/bugtracker.service';
import { HeaderService } from './header.service';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss']
})
export class HeaderComponent {

    showLoading = false;
    loadingLabel = '';
    loadingProgress = 0;
    loadingDownload = true;

    constructor(private loginService: LoginService, private router: Router, private bugtrackerService: BugtrackerService,
                private headerService: HeaderService) {
        this.headerService.cbProgress = (progress: number) => { this.loadingProgress = progress; };
        this.headerService.cbShowProgress = (show: boolean, name?: string, download= true) => {
            if (show) {
                this.showLoading = true;
                this.loadingLabel = name;
                this.loadingProgress = 0;
                this.loadingDownload = download;
            } else {
                this.showLoading = false;
                this.loadingLabel = '';
                this.loadingProgress = 0;
            }
        };
    }

    goToEditor(): void {
        this.router.navigate(['/' + ROUTES.EDITOR]);
    }

    goToGallery(): void {
        this.router.navigate(['/' + ROUTES.GALLERY]).then(() => {setTimeout(() => { window.location.reload(); }, 10); });
    }

    goToTasks(): void {
        this.router.navigate(['/' + ROUTES.TASKS]).then(() => {setTimeout(() => { window.location.reload(); }, 10); });
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
        this.router.navigate(['/' + ROUTES.LOGIN]).then(() => {setTimeout(() => { window.location.reload(); }, 10); });
    }

    toggleBugtracker(): void {
        this.bugtrackerService.toggleVisible();
    }
}
