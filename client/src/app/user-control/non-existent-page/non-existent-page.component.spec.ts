import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NonExistentPageComponent } from './non-existent-page.component';

describe('NonExistentPageComponent', () => {
  let component: NonExistentPageComponent;
  let fixture: ComponentFixture<NonExistentPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NonExistentPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NonExistentPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
