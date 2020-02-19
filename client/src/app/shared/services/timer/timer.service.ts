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

  initTime(seconds: number): Date {
    seconds = seconds + this.timeOffset;
    const counter: Date = new Date(0, 0, 0, 0, 0, 0, 0);
    counter.setSeconds(seconds);
    return counter;
  }

  backup(seconds: number, obsTimer) {
    this.timeOffset = seconds;
    return obsTimer;
  }

  resetTimer(counter: Date, obsTimer) {
    this.timeOffset = 0;
    counter = new Date(0, 0, 0, 0, 0, 0);
    counter.setSeconds(0);

    if (obsTimer !== undefined) {
      this.backup(0, obsTimer).unsubscribe();
    }

    return counter;
  }
}
