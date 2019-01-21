import { Component, OnInit } from '@angular/core';
import { TimerService } from './timer.service';

@Component({
    selector: 'app-timer',
    templateUrl: './timer.component.html',
    styleUrls: ['./timer.component.scss']
})
export class TimerComponent implements OnInit {

    public minuteText = '';
    public secondText = '';

    constructor(public timerService: TimerService) {
    }

    ngOnInit(): void {
        this.timerService.timeStrChanged.subscribe((time: string) => {
            const time_split = time.split(':');
            this.minuteText = time_split.slice(0, -1).join(' : ');
            this.secondText = time_split[time_split.length - 1];
        });
    }

    toggleTimer(): void {
        if (this.timerService.running) {
            this.timerService.stop();
        } else {
            this.timerService.start();
        }
    }

    resetTimer(): void {
        this.timerService.reset();
    }

}
