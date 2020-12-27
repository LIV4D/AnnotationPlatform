import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskDialogSubmissionComponent } from './task-dialog-submission.component';

describe('TaskSubmissionComponent', () => {
  let component: TaskDialogSubmissionComponent;
  let fixture: ComponentFixture<TaskDialogSubmissionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TaskDialogSubmissionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TaskDialogSubmissionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
