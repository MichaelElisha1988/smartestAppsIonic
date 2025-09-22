import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent } from '@ionic/angular/standalone';
import { TaskListComponent } from './task-list/task-list.component';
import { UserHeaderComponent } from './user-header/user-header.component';
import { MainFooterComponent } from './main-footer/main-footer.component';
import { AddTaskPopupComponent } from './popups/addd-task-popup/add-task-popup.component';

@Component({
  selector: 'app-todo-list',
  templateUrl: './todo-list.page.html',
  styleUrls: ['./todo-list.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    CommonModule,
    FormsModule,
    TaskListComponent,
    UserHeaderComponent,
    MainFooterComponent,
    AddTaskPopupComponent,
  ],
})
export class TodoListPage implements OnInit {
  constructor() {}

  ngOnInit() {}
}
