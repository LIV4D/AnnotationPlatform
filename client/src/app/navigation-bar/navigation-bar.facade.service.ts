import { BugtrackerService } from './../shared/services/bugtracker.service';
import { Injectable, Injector } from '@angular/core';
import { LoginService } from '../shared/services/login.service';
import { HeaderService } from '../shared/services/header.service';
import { MatDialog } from '@angular/material/dialog';

@Injectable()
export class NavigationBarFacadeService {

  // NavBarService wrapper -- TODO: NavBarService is not created yet

  // private _navBarService: NavBarService;
  // public get navBarService(): NavBarService {
  //   if (!this._navBarService) {
  //     this._navBarService = this.injector.get(NavBarService);
  //   }
  //   return this._navBarService;
  // }
  // ... add the other service wrappers

  constructor(private injector: Injector, private loginService: LoginService, private bugtrackerService: BugtrackerService,
    private headerService: HeaderService) {  }

  initProgress(loadingProgress, showLoading, loadingLabel, loadingDownload) {
    this.headerService.cbProgress = (progress: number) => { loadingProgress = progress; };
    this.headerService.cbShowProgress = (show: boolean, name?: string, download= true) => {
      if (show) {
        showLoading = true;
        loadingLabel = name;
        loadingProgress = 0;
        loadingDownload = download;
      } else {
        showLoading = false;
        loadingLabel = '';
        loadingProgress = 0;
      }
    };
  }

  logout() {
    this.loginService.logout();
  }

  // ... add the other functions for the other services
}
