import { Component, OnInit } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TaskModel } from 'src/app/models/task.model';
import { DataService } from 'src/app/services/data.service';
import { PopUpService } from 'src/app/services/popups.service';

@Component({
  selector: 'app-add-task-popup',
  templateUrl: './add-task-popup.component.html',
  styleUrls: ['./add-task-popup.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
})
export class AddTaskPopupComponent implements OnInit {
  taskform = new FormGroup({
    task: new FormControl('', {
      updateOn: 'change',
      validators: [Validators.required],
    }),
    author: new FormControl('', {
      updateOn: 'change',
      validators: [Validators.required],
    }),
    date: new FormControl('', {
      updateOn: 'change',
      validators: [Validators.required],
    }),
    status: new FormControl("don't you forget", {
      updateOn: 'change',
      validators: [Validators.required],
    }),
    isCheckBox: new FormControl(false, {
      updateOn: 'change',
    }),
  });

  hidden: boolean = true;

  constructor(
    private readonly popupSrv: PopUpService,
    private readonly dataSrv: DataService
  ) {
    this.popupSrv.addTask$.subscribe((data: boolean) => {
      this.taskform.controls.date.setValue(this.dataSrv.getDateString());
      this.taskform.controls.author.setValue(this.dataSrv.getLoginName());
      this.onPopup(data);
    });
  }

  ngOnInit(): void {
    this.onPopup(true);
  }

  addTask(ev: any) {
    this.dataSrv.updateTaskList(this.createTaskModel());
    this.onPopup(true);
  }

  onPopup(OC: boolean) {
    if (OC) {
      document.body.style.overflow = '';
    }
    this.hidden = OC;
  }

  createTaskModel(): TaskModel {
    return {
      listID: 0,
      id: 0,
      task: this.taskform.value.task!,
      author: this.taskform.value.author!,
      date: this.taskform.value.date!,
      status: this.taskform.value.status!,
      currentStatus: 1,
      editMode: false,
      seeInfo: false,
      color: Math.floor(Math.random() * 16777215).toString(16),
      isCheckBox: this.taskform.value.isCheckBox!,
      didIt: false,
    };
  }
}
