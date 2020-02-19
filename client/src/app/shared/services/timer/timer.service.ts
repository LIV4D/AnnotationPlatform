import { Injectable } from '@angular/core';
import { timer, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TimerService {
  timer = timer(0, 1000);

  constructor() {
   }

  toggle() {
    return this.timer;
  }
}
