import { TestBed } from '@angular/core/testing';

import { TimerService } from './timer.service';

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

    obsTimer = service.toggle ? service.toggle()
    .subscribe( (seconds) => counter = service.initTime(0, seconds) )
    : service.backup(counter.getHours(), counter.getMinutes(), counter.getSeconds(), obsTimer).unsubscribe();

    service.backup(1, 59, 59, obsTimer);

    const testDate = new Date(0, 0, 0, 1, 59, 59, 0);
    expect(service.timeOffset).toBe(testDate.getSeconds());
  });
});
