import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TimerService {

  running = false;

  constructor() { }

  toggle() {
    if (!this.running) {
      this.start();
    } else {
      this.stop();
    }
    this.running = !this.running;
  }

  start() {

  }

  stop() {

  }
}
