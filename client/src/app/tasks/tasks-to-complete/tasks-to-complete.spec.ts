import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TasksToCompleteComponent } from './tasks-to-complete.component';

describe('NavigationBarComponent', () => {
  let component: TasksToCompleteComponent ;
  let fixture: ComponentFixture<TasksToCompleteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TasksToCompleteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TasksToCompleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
