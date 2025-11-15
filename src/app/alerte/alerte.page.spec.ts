import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AlertePage } from './alerte.page';

describe('AlertePage', () => {
  let component: AlertePage;
  let fixture: ComponentFixture<AlertePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AlertePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
