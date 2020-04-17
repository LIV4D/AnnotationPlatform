import { Injectable, Injector } from '@angular/core';
import { LoginService } from '../shared/services/login.service';
import { HeaderService } from '../shared/services/header.service';

@Injectable()
export class NavigationBarFacadeService {

  constructor(private injector: Injector, private loginService: LoginService,
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
}
