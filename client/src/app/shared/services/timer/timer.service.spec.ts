import { TestBed } from '@angular/core/testing';

import { TimerService } from './timer.service';
import { bufferToggle } from 'rxjs/operators';

describe('TimerService', () => {
  let service: TimerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TimerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should keep going with hours', () => {
    let counter: Date = service.initTime(59, 59);
    let obsTimer;

    obsTimer = service.toggle().subscribe( (seconds) => counter = service.initTime(0, seconds) );
    service.backup(1, 59, 59, obsTimer);
    obsTimer = service.backup(1, 59, 59, obsTimer).unsubscribe();
    const testDate = new Date(0, 0, 0, 1, 59, 59, 0);

    expect(service.timeOffset).toBe(testDate.getHours() * 60 * 60 + testDate.getMinutes() * 60 + testDate.getSeconds());
  });
});
