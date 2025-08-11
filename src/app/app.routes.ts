import { Routes } from '@angular/router';
import { LoginGuard } from './guards/login.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./routes/login/login.page').then((m) => m.LoginPage),
  },
  {
    path: 'home',
    loadComponent: () =>
      import('./routes/home/home.page').then((m) => m.HomePage),
  },
  {
    path: 'policy',
    loadComponent: () =>
      import('./routes/policy/policy.page').then((m) => m.PolicyPage),
  },
  {
    path: 'todo-list',
    loadComponent: () =>
      import('./routes/todo-list/todo-list.page').then((m) => m.TodoListPage),
    canActivate: [LoginGuard],
  },
  {
    path: 'recepies-book',
    loadComponent: () =>
      import('./routes/recepies-book/recepies-book.page').then(
        (m) => m.RecepiesBookPage
      ),
    canActivate: [LoginGuard],
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
];
