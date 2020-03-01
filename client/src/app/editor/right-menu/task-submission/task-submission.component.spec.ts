import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskSubmissionComponent } from './task-submission.component';

describe('TaskSubmissionComponent', () => {
  let component: TaskSubmissionComponent;
  let fixture: ComponentFixture<TaskSubmissionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TaskSubmissionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TaskSubmissionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
