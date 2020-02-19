import { TestBed } from '@angular/core/testing';

import { TimerFacadeService } from './timer.facade.service';

describe('Timer.FacadeService', () => {
  let service: TimerFacadeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TimerFacadeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
