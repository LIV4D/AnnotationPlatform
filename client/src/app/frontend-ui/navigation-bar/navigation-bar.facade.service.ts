import { Injectable, Injector } from '@angular/core';
import { LoginService } from '../../navigation-logic/auth/login.service';
import { UIStatusService } from '../../shared/services/ui-status.service';
import { BackgroundJob } from '../../../utilities/background-job.model';
import { isNullOrUndefined } from 'util';

@Injectable()
export class NavigationBarFacadeService {

  constructor(private injector: Injector, private loginService: LoginService,
    private uiStatusService: UIStatusService) {  }

  fetchBackgroundJob(current: BackgroundJob=undefined): BackgroundJob {
    if(isNullOrUndefined(current))
        return this.uiStatusService.backgroundJobs[0];
    const jobId = this.uiStatusService.backgroundJobs.indexOf(current);
    if(jobId>=0 && jobId+1<this.uiStatusService.backgroundJobs.length)
        return this.uiStatusService.backgroundJobs[jobId+1];
    return this.uiStatusService.backgroundJobs[0];
  }

  logout() {
    this.loginService.logout();
  }
}
