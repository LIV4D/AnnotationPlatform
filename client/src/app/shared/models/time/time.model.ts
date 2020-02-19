import { Time } from '@angular/common';

// tslint:disable-next-line: class-name
export class customtime implements Time {

  constructor(public hours: number, public minutes: number, public seconds: number) {
    this.hours = hours;
    this.minutes = minutes;
    this.seconds = seconds;
  }


}
