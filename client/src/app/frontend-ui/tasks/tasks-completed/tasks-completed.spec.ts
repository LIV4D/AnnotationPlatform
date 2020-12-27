import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TasksCompletedComponent } from './tasks-completed.component';

describe('NavigationBarComponent', () => {
  let component: TasksCompletedComponent ;
  let fixture: ComponentFixture<TasksCompletedComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TasksCompletedComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TasksCompletedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
