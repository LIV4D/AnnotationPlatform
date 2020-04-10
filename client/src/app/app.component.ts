import { Router } from '@angular/router';
import { AppService } from './shared/services/app.service';
import { MatIconRegistry } from "@angular/material/icon";
import { DomSanitizer } from "@angular/platform-browser";
import { Component, OnInit, ChangeDetectorRef, AfterViewChecked } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'client';
  constructor(public appService: AppService, public router: Router, public cdRef: ChangeDetectorRef,
    private matIconRegistry: MatIconRegistry, private domSanitizer: DomSanitizer) {
  const sanURL = this.domSanitizer.bypassSecurityTrustResourceUrl;

  this.matIconRegistry.addSvgIcon("tree", sanURL("../assets/icons/tree.svg"));
  }

  ngOnInit(): void {
  }

  ngAfterViewChecked(): void {
  this.cdRef.detectChanges();
  }
}
