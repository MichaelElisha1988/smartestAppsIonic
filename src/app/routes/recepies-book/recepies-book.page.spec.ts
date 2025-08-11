import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RecepiesBookPage } from './recepies-book.page';

describe('RecepiesBookPage', () => {
  let component: RecepiesBookPage;
  let fixture: ComponentFixture<RecepiesBookPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(RecepiesBookPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
