import { Component } from '@angular/core';
import { NavigationBarFacadeService } from './navigation-bar.facade.service';
import { Router } from '@angular/router';

import * as screenfull from 'screenfull';
import {Screenfull} from 'screenfull';
import { HeaderService } from '../shared/services/header.service';

@Component({
  selector: 'app-navigation-bar',
  templateUrl: './navigation-bar.component.html',
  styleUrls: ['./navigation-bar.component.scss']
})
export class NavigationBarComponent {

  collapsed = true;
  showLoading = false;
  loadingLabel = '';
  loadingProgress = 0;
  loadingDownload = true;

  constructor(private navigationBarFacadeService: NavigationBarFacadeService,
              public router: Router) {
    this.navigationBarFacadeService.initProgress(this.loadingProgress, this.showLoading, this.loadingLabel, this.loadingDownload);
  }

  toggleFullScreen(): void {
    const sreenfullEntity = screenfull as Screenfull;

    const fullscreenIcon = document.getElementById('fullscreenIcon');
    if (sreenfullEntity.isEnabled) {
      fullscreenIcon.innerHTML =  'fullscreen_exit';
    } else {
      fullscreenIcon.innerHTML =  'fullscreen';
    }
    sreenfullEntity.toggle();
  }

  toggleBugtracker(): void {
    this.navigationBarFacadeService.toggleBugtracker();
  }

  logout(): void {
    this.navigationBarFacadeService.logout();
  }
}
