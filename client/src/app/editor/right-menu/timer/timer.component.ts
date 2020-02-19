import { Component, OnInit, OnDestroy } from '@angular/core';
import { TimerFacadeService } from './timer.facade.service';
import { LogoutService } from 'src/app/shared/services/logout.service';

@Component({
  selector: 'app-timer',
  templateUrl: './timer.component.html',
  styleUrls: ['./timer.component.scss']
})
export class TimerComponent implements OnInit, OnDestroy {

  counter: Date;
  toggle = false;
  obsTimer;

  constructor(private timerFacade: TimerFacadeService) { }

  ngOnInit(): void {
    this.toggleTimer();
  }

  toggleTimer(): void {
    this.toggle = !this.toggle;

    this.obsTimer = this.toggle ? this.timerFacade.toggle()
    .subscribe( (seconds) => this.counter = this.timerFacade.initTime(0, seconds) )
    : this.timerFacade.backup(this.counter.getHours(), this.counter.getMinutes(), this.counter.getSeconds(), this.obsTimer).unsubscribe();
  }

  resetTimer() {
    this.toggle = false;
    this.counter = this.timerFacade.resetTimer(this.counter, this.obsTimer);
  }

  ngOnDestroy() {
    this.obsTimer.unsubscribe();
  }
}
