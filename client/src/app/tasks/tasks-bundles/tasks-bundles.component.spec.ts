import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TasksBundlesComponent } from './tasks-bundles.component';

describe('TasksBundlesComponent', () => {
  let component: TasksBundlesComponent;
  let fixture: ComponentFixture<TasksBundlesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TasksBundlesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TasksBundlesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
