import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TodoListPage } from './todo-list.page';

describe('TodoListPage', () => {
  let component: TodoListPage;
  let fixture: ComponentFixture<TodoListPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(TodoListPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
