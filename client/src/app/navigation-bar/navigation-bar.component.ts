import { Component, OnInit } from '@angular/core';

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

  constructor() { }

  ngOnInit() {
  }

}
