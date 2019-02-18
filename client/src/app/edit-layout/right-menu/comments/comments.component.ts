import { AppService } from './../../../app.service';
import { Component, OnInit } from '@angular/core';
import { CommentsService } from './comments.service';

@Component({
    selector: 'app-comments',
    templateUrl: './comments.component.html',
    styleUrls: ['./comments.component.scss']
})
export class CommentsComponent implements OnInit {
    public commentValue = '';
    constructor(public appService: AppService, public commentService: CommentsService) {
     }

    ngOnInit(): void {
        this.commentService.commentChanged.subscribe( (c) => { this.commentValue = c; });
    }

    enableOnKeyDown(): void {
        this.appService.keyEventsEnabled = true;
    }

    disableOnKeyDown(): void {
        this.appService.keyEventsEnabled = false;
    }

    commentChanged(): void {
        this.commentService.visibleComment = this.commentValue;
    }
}
