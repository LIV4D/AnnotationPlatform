import { Component, OnInit } from '@angular/core';
import { NavigationBarFacadeService } from './navigation-bar.facade.service';
import { Router } from '@angular/router';

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

  constructor(private navigationBarFacadeService: NavigationBarFacadeService, private router: Router) {  }

  ngOnInit() {
  }

  logout(): void {
    this.navigationBarFacadeService.logout();

}
}
