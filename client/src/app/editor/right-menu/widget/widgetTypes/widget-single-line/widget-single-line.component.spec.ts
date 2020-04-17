import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WidgetSingleLineComponent } from './widget-single-line.component';

describe('WidgetSingleLineComponent', () => {
  let component: WidgetSingleLineComponent;
  let fixture: ComponentFixture<WidgetSingleLineComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WidgetSingleLineComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WidgetSingleLineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
