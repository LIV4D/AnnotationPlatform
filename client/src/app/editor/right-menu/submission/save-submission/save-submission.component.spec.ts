import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SaveSubmissionComponent } from './save-submission.component';

describe('SaveSubmissionComponent', () => {
  let component: SaveSubmissionComponent;
  let fixture: ComponentFixture<SaveSubmissionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SaveSubmissionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SaveSubmissionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
