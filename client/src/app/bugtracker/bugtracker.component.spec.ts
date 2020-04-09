import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BugtrackerComponent } from './bugtracker.component';

describe('BugtrackerComponent', () => {
  let component: BugtrackerComponent;
  let fixture: ComponentFixture<BugtrackerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BugtrackerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BugtrackerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
