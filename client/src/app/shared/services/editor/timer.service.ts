import { Injectable } from '@angular/core';
import { timer, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TimerService {
  timer = timer(0, 1000);
  timeOffset = 0;

  constructor() {
   }

  toggle() {
    return this.timer;
  }

  initTime(minutes: number, seconds: number): Date {
    seconds = seconds + this.timeOffset;
    const counter: Date = this.setCounter(seconds);
    return counter;
  }

  backup(hours: number, minutes: number, seconds: number, obsTimer) {
    this.timeOffset = seconds + (minutes * 60) + (hours * 60 * 60) ;
    return obsTimer;
  }

  resetTimer(counter: Date, obsTimer) {
    this.timeOffset = 0;
    counter = this.setCounter(0);

    if (obsTimer !== undefined) {
      this.backup(0, 0, 0, obsTimer).unsubscribe();
    }
    return counter;
  }

  private setCounter(seconds: number) {
    const counter = new Date(0, 0, 0, 0, 0, 0);
    counter.setSeconds(seconds);
    return counter;
  }
}
