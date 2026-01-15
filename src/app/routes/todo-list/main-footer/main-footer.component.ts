import { Component, inject, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from 'src/app/services/data.service';
import { PopUpService } from 'src/app/services/popups.service';
import { TaskModel } from 'src/app/models/task.model';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { smartestAppsStore } from 'src/app/services/data-store.service';

@Component({
  selector: 'main-footer',
  templateUrl: './main-footer.component.html',
  styleUrls: ['./main-footer.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
})
export class MainFooterComponent implements OnInit {
  addTaskMode: boolean = false;
  smartestAppsStore = inject(smartestAppsStore);
  
  listIdIsEmpty: boolean = false;

  taskform = new FormGroup({
    title: new FormControl('', {
      updateOn: 'change',
      validators: [Validators.required],
    }),
  });

  constructor(
    private readonly popupSrv: PopUpService,
    private readonly dataSrv: DataService
  ) {
      effect(() => {
          if(this.dataSrv.selectedId()) {
              this.listIdIsEmpty = true;
          } else {
              this.listIdIsEmpty = false;
          }
      });
  }

  ngOnInit(): void {
  } 


  openAddTask() {
    this.addTaskMode = !this.addTaskMode;
    if (!this.addTaskMode && this.taskform.controls.title.value) {
      this.dataSrv.updateTaskList(this.createTaskModel());
    } else {
      this.taskform.reset();
    }
  }

  async refreshList() {
    this.smartestAppsStore.showLoader(true);
    await Promise.all([
        this.dataSrv.getTaskList(),
        this.dataSrv.getListId()
    ]);
    setTimeout(() => {
      this.smartestAppsStore.showLoader(false);
    }, 1000);
  }

  createTaskModel(): TaskModel {
    return {
      listID: 0,
      id: 0,
      task: this.taskform.controls.title.value!,
      author: this.dataSrv.getLoginName(),
      date: this.dataSrv.getDateString(),
      status: "don't you forget",
      currentStatus: 1,
      editMode: false,
      seeInfo: false,
      color: Math.floor(Math.random() * 16777215).toString(16),
      isCheckBox: true,
      didIt: false,
    };
  }
}
