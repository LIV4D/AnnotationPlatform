import { Component, OnInit, OnDestroy } from '@angular/core';
import { TimerService } from 'src/app/shared/services/timer/timer.service';

@Component({
  selector: 'app-timer',
  templateUrl: './timer.component.html',
  styleUrls: ['./timer.component.scss']
})
export class TimerComponent implements OnInit, OnDestroy {

  counter: Date;
  timeOffset = 0;
  toggle = false;
  obsTimer;

  constructor(private timerService: TimerService) { }

  ngOnInit(): void {
    this.toggleTimer();
  }

  toggleTimer(): void {
    this.toggle = !this.toggle;
    this.obsTimer = this.toggle ? this.timerService.toggle()
    .subscribe( (seconds) => this.counter = this.timerService.test(seconds, this.timeOffset) )
    // : this.backup();
    : this.timerService.backup(this.counter.getSeconds(), this.obsTimer).unsubscribe();
  }

  // backup() {
  //   this.timeOffset = this.counter.getSeconds();
  //   this.obsTimer.unsubscribe();
  // }

  ngOnDestroy() {
    this.obsTimer.unsubscribe();
  }
}
