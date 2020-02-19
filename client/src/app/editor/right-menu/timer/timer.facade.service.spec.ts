import { TestBed } from '@angular/core/testing';

import { Timer.FacadeService } from './timer.facade.service';

describe('Timer.FacadeService', () => {
  let service: Timer.FacadeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Timer.FacadeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
