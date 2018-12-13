import { AppService } from './../../../app.service';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommentsService } from './comments.service';

@Component({
    selector: 'app-comments',
    templateUrl: './comments.component.html',
    styleUrls: ['./comments.component.scss']
})
export class CommentsComponent implements OnInit {

    @ViewChild('comment') comment: ElementRef;
    constructor(public appService: AppService) { }

    ngOnInit(): void {
    }

    enableOnKeyDown(): void {
        this.appService.keyEventsEnabled = true;
    }

    disableOnKeyDown(): void {
        this.appService.keyEventsEnabled = false;
    }
}
