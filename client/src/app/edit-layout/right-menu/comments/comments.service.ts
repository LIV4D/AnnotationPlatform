import { Injectable } from '@angular/core';
import { TimerService } from '../timer/timer.service';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class CommentsService {
    public commentChanged = new BehaviorSubject<string>('');
    public visibleComment = '';

    constructor (private timerService: TimerService) {}

    set comment(c: string) {
        if (c === null || c === undefined) {
            c = '';
        }

        if (c.startsWith('[time=')) {
            c = c.substr(6);
            const c_split = c.split(']', 1);
            c = c_split[1];
            this.timerService.setTimeStr(c_split[0]);
            this.timerService.start();
        } else {
            this.timerService.time = 0;
            this.timerService.start();
        }
        this.visibleComment = c;
        this.commentChanged.next(c);
    }

    get comment(): string {
        let c = '';
        if (this.timerService.time > 0) {
            c += '[time=' + this.timerService.getTimeStr() + ']';
        }
        c += this.visibleComment;
        return c;
    }
}
