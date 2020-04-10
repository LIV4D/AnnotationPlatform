import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WidgetMultipleLinesComponent } from './widget-multiple-lines.component';

describe('WidgetMultipleLinesComponent', () => {
  let component: WidgetMultipleLinesComponent;
  let fixture: ComponentFixture<WidgetMultipleLinesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WidgetMultipleLinesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WidgetMultipleLinesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
