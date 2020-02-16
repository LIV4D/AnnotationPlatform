import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-timer',
  templateUrl: './timer.component.html',
  styleUrls: ['./timer.component.scss']
})
export class TimerComponent implements OnInit {

  public minuteText = '00';
  public secondText = '00';

  constructor() { }

  ngOnInit(): void {
  }

}
