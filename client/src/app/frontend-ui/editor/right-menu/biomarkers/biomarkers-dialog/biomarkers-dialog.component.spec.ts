import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BiomarkersDialogComponent } from './biomarkers-dialog.component';

describe('BiomarkersDialogComponent', () => {
  let component: BiomarkersDialogComponent;
  let fixture: ComponentFixture<BiomarkersDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BiomarkersDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BiomarkersDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
