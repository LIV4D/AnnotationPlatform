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

  backup(counter: number, obsTimer) {
    return this.timerService.backup(counter, obsTimer);
  }

  initTime(seconds: number): Date {
    return this.timerService.initTime(seconds);
  }
}
