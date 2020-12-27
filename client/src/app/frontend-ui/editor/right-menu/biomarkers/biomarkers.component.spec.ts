import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BiomarkersComponent } from './biomarkers.component';

describe('BiomarkersComponent', () => {
  let component: BiomarkersComponent;
  let fixture: ComponentFixture<BiomarkersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BiomarkersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BiomarkersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
