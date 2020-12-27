import { TestBed } from '@angular/core/testing';

import { Gallery.FacadeService } from './gallery.facade.service';

describe('Gallery.FacadeService', () => {
  let service: Gallery.FacadeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Gallery.FacadeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
