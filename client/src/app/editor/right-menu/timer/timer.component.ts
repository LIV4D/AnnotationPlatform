import { Component, OnInit, OnDestroy } from '@angular/core';
import { TimerService } from 'src/app/shared/services/timer/timer.service';

@Component({
  selector: 'app-timer',
  templateUrl: './timer.component.html',
  styleUrls: ['./timer.component.scss']
})
export class TimerComponent implements OnInit, OnDestroy {

  counter: Date;
  public minuteText = '00';
  public secondText = '00';
  toggle = false;
  obsTimer;

  constructor(private timerService: TimerService) { }

  ngOnInit(): void {
    this.toggleTimer();
  }

  toggleTimer(): void {
    this.toggle = !this.toggle;
    this.obsTimer = this.toggle ? this.timerService.toggle().subscribe(
        (x) => {
          this.counter = new Date(0, 0, 0, 0, 0, 0);
          this.counter.setSeconds(x);
        }
      ) : this.obsTimer.unsubscribe();
  }

  ngOnDestroy() {
    this.obsTimer.unsubscribe();
  }
}
