import { TestBed } from '@angular/core/testing';

import { CommentBoxFacadeService } from './comment-box.facade.service';

describe('CommentBox.FacadeService', () => {
  let service: CommentBoxFacadeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CommentBoxFacadeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
