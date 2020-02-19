import { Injectable } from '@angular/core';
import { TimerService } from 'src/app/shared/services/timer/timer.service';

@Injectable({
  providedIn: 'root'
})
export class TimerFacadeService {

  constructor(private timerService: TimerService) { }

  toggle() {
    return this.timerService.toggle();
  }

  backup(hours: number, minutes: number, counter: number, obsTimer) {
    return this.timerService.backup(hours, minutes, counter, obsTimer);
  }

  initTime(minutes: number, seconds: number): Date {
    return this.timerService.initTime(minutes, seconds);
  }

  resetTimer(counter: Date, obsTimer) {
    return this.timerService.resetTimer(counter, obsTimer);
  }
}
