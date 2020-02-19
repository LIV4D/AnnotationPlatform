import { Component, OnInit, OnDestroy } from '@angular/core';
import { TimerFacadeService } from './timer.facade.service';

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

  constructor(private timerFacade: TimerFacadeService) { }

  ngOnInit(): void {
    this.toggleTimer();
  }

  toggleTimer(): void {
    this.toggle = !this.toggle;

    this.obsTimer = this.toggle ? this.timerFacade.toggle()
    .subscribe( (seconds) => this.counter = this.timerFacade.initTime(seconds) )
    : this.timerFacade.backup(this.counter.getSeconds(), this.obsTimer).unsubscribe();
  }

  ngOnDestroy() {
    this.obsTimer.unsubscribe();
  }
}
