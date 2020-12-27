import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ToolElementComponent } from './tool-element.component';

describe('ToolElementComponent', () => {
  let component: ToolElementComponent;
  let fixture: ComponentFixture<ToolElementComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ToolElementComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ToolElementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
