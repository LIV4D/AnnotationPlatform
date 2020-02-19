import { Injectable } from '@angular/core';
import { timer, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TimerService {

  running = false;
  timer = timer(1000, 1000);

  constructor() {
   }

  toggle() {
    return this.timer;
  }
}
