import { isNullOrUndefined } from 'util';
import { StorageService } from './../shared/services/storage.service';
import { Component, OnInit } from '@angular/core';
import { NavigationBarFacadeService } from './navigation-bar.facade.service';
import { Router } from '@angular/router';
import * as screenfull from 'screenfull';
import {Screenfull} from 'screenfull';
import { MatDialog } from '@angular/material/dialog';
import { BugtrackerComponent } from '../bugtracker/bugtracker.component';
import { Subject, Subscription } from 'rxjs';
import { BackgroundJob } from '../shared/models/background-job.model';
import { PassThrough } from 'stream';
import { isUndefined } from 'underscore';

@Component({
  selector: 'app-navigation-bar',
  templateUrl: './navigation-bar.component.html',
  styleUrls: ['./navigation-bar.component.scss']
})
export class NavigationBarComponent implements OnInit {

  collapsed = true;
  isAdmin = false;
  isResearcher = false;
  userRole = '';
  storageSub = new Subject<string>();

  displayedBackgroundJob: BackgroundJob = undefined;
  backJobTimer = undefined;
  showBackJob = false;
  backJobLabel = '';
  backJobDescription = '';
  backJobProgress = 0;
  backJobIcon = '';
  backJobSubscription: Subscription[] = [];

  constructor(private navigationBarFacadeService: NavigationBarFacadeService,
              public bugtrackerDialog: MatDialog, public router: Router, private storageService: StorageService) {

    if (!isNullOrUndefined(JSON.parse(localStorage.getItem('currentUser'))))
      this.userRole = JSON.parse(localStorage.getItem('currentUser')).user.role;

  }

  ngOnInit() {

    this.cycleDisplayedBackgroundJob();

    /// TODO: Switch current user to a proper UI State.
    this.storageService.watchStorage().subscribe((data: string) => {
      // this will call whenever your localStorage data changes
      this.userRole = JSON.parse(localStorage.getItem('currentUser')).user.role;
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

  /**
   * Opens Bugtracker component in an ngMaterial dialog
   */
  toggleBugtracker(): void {
    const dialogRef = this.bugtrackerDialog.open(BugtrackerComponent, {
       hasBackdrop: false
    });

    dialogRef.afterClosed().subscribe(result => {
    });

  }

  logout(): void {
    this.navigationBarFacadeService.logout();
  }

    cycleDisplayedBackgroundJob() {
        if(this.backJobTimer!==undefined){
            clearTimeout(this.backJobTimer);
        }
        const nextBackJob = this.navigationBarFacadeService.fetchBackgroundJob(this.displayedBackgroundJob);
        this.displayBackgroundJob(nextBackJob);
        this.backJobTimer = setTimeout(() => {
            this.backJobTimer = undefined;
            this.cycleDisplayedBackgroundJob();
        }, isUndefined(nextBackJob) ? 1000 : 3500);
    }

    displayBackgroundJob(job: BackgroundJob=undefined){
        if (!isNullOrUndefined(this.displayedBackgroundJob)) {
            this.backJobSubscription.forEach(sub => sub.unsubscribe());
            this.backJobDescription = '';
            this.backJobIcon = '';
            this.backJobLabel = '';
        }

        this.displayedBackgroundJob = job;

        if (!isNullOrUndefined(job)) {
            this.backJobDescription = job.description;
            this.backJobLabel = job.title;
            switch(job.jobType){
                case 'download':
                    this.backJobIcon = "cloud_download";
                break;
                case 'upload':
                    this.backJobIcon = "cloud_upload";
                default:
                    this.backJobIcon = "";
            }

            const progressSub = job.progress.subscribe(p => this.backJobProgress = p*100);
            const stateSub = job.state.subscribe(s => {
                if (s !== 'running')
                    this.cycleDisplayedBackgroundJob();
            });
            this.backJobSubscription = [progressSub, stateSub];
            this.showBackJob = true;
        } else {
            this.showBackJob = false;
        }
    }

}
