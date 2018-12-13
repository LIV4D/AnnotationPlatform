import { Router } from '@angular/router';
import { AppService } from './app.service';
import { Component, OnInit, ChangeDetectorRef, AfterViewChecked } from '@angular/core';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, AfterViewChecked {

    constructor(public appService: AppService, public router: Router, public cdRef: ChangeDetectorRef) { }

    ngOnInit(): void {
    }

    ngAfterViewChecked(): void {
        this.cdRef.detectChanges();
    }
}
