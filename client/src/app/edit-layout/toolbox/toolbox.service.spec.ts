import { TestBed } from '@angular/core/testing';

import { ToolboxService } from './toolbox.service';

describe('ToolboxService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ToolboxService = TestBed.get(ToolboxService);
    expect(service).toBeTruthy();
  });
});
