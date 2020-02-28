import { Component, OnInit } from '@angular/core';
import { NavigationBarFacadeService } from './navigation-bar.facade.service';
import { Router } from '@angular/router';

import * as screenfull from 'screenfull';
import {Screenfull} from 'screenfull';

@Component({
  selector: 'app-navigation-bar',
  templateUrl: './navigation-bar.component.html',
  styleUrls: ['./navigation-bar.component.scss']
})
export class NavigationBarComponent implements OnInit {

  collapsed = true;
  showLoading = false;
  loadingLabel = '';
  loadingProgress = 0;
  loadingDownload = true;

  constructor(private navigationBarFacadeService: NavigationBarFacadeService, public router: Router) {  }

  ngOnInit() {
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

  logout(): void {
    this.navigationBarFacadeService.logout();
  }
}
