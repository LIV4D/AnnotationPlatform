import { StorageService } from './../shared/services/storage.service';
import { Component } from '@angular/core';
import { NavigationBarFacadeService } from './navigation-bar.facade.service';
import { Router } from '@angular/router';

import * as screenfull from 'screenfull';
import {Screenfull} from 'screenfull';
import { HeaderService } from '../shared/services/header.service';
import { Observable, Subject } from 'rxjs';

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
  isAdmin = false;
  isResearcher = false;
  userRole = '';
  storageSub = new Subject<string>();

  constructor(private headerService: HeaderService, private navigationBarFacadeService: NavigationBarFacadeService,
              public router: Router, private storageService: StorageService) {

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

  ngOnInit() {
    this.storageService.watchStorage().subscribe((data: string) => {
      // this will call whenever your localStorage data changes
      this.userRole = JSON.parse(localStorage.getItem('currentUser')).user.role;
      console.log(this.userRole);
    });
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
