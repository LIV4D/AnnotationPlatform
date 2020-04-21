import { TestBed } from '@angular/core/testing';

import { CommentBoxService } from './comment-box.service';

describe('CommentBoxService', () => {
  let service: CommentBoxService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CommentBoxService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
