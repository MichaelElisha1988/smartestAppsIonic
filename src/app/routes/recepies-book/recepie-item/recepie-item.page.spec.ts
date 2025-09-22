import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RecepieItemPage } from './recepie-item.page';

describe('RecepieItemPage', () => {
  let component: RecepieItemPage;
  let fixture: ComponentFixture<RecepieItemPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(RecepieItemPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
