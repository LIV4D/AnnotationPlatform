import { Injectable } from '@angular/core';
import { TimerService } from '../timer/timer.service';
import { BehaviorSubject } from 'rxjs';
import { BiomarkersService } from '../biomarkers/biomarkers.service';

@Injectable()
export class CommentsService {
    public commentChanged = new BehaviorSubject<string>('');
    public visibleComment = '';
    private onlyEnable = '';

    constructor (private timerService: TimerService, private biomarkersService: BiomarkersService) {}

    set comment(comment: string) {
        if (comment === null || comment === undefined) {
            comment = '';
        }

        let visibleComment = '';
        let timeStr = '';
        let onlyEnable = new Array<string>();

        comment.split(']').forEach( (c) => {
            const trimmed_c = c.trim();
            if (trimmed_c.startsWith('[time=')) {
                timeStr = trimmed_c.substr(6);
            } else if (trimmed_c.startsWith('[onlyEnable=')) {
                onlyEnable = new Array<string>();
                c = trimmed_c.substr(12);
                this.onlyEnable = c;
                c.split(',').forEach( (b: string) => {
                    if (b.trim().length > 0) {
                        onlyEnable.push(b.trim());
                    }
                });
            } else {
                visibleComment += c + ']';
            }
        });
        visibleComment = visibleComment.substr(0, visibleComment.length - 1).trim();

        // Set timer
        if (timeStr.length > 0) {
            this.timerService.setTimeStr(timeStr);
            this.timerService.start();
        } else {
            this.timerService.time = 0;
            this.timerService.start();
        }

        // Set only enabled label
        this.biomarkersService.onlyEnabledBiomarkers = onlyEnable;
        if (onlyEnable.length === 0) {
            this.onlyEnable = '';
        }

        // Apply new comment
        this.visibleComment = visibleComment;
        this.commentChanged.next(visibleComment);
    }

    get comment(): string {
        let c = '';
        if (this.timerService.time > 0) {
            c += '[time=' + this.timerService.getTimeStr() + '] ';
        }
        if (this.onlyEnable.length > 0) {
            c += '[onlyEnable=' + this.onlyEnable + '] ';
        }
        c += this.visibleComment;
        return c;
    }
}
