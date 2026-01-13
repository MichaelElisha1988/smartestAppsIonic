import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
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

@Component({
  selector: 'main-footer',
  templateUrl: './main-footer.component.html',
  styleUrls: ['./main-footer.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
})
export class MainFooterComponent implements OnInit, OnDestroy {
  addTaskMode: boolean = false;
  constructor(
    private readonly popupSrv: PopUpService,
    private readonly dataSrv: DataService
  ) {}
  listIdIsEmpty: boolean = false;
  Sub$ = new Subscription();

  taskform = new FormGroup({
    title: new FormControl('', {
      updateOn: 'change',
      validators: [Validators.required],
    }),
  });

  ngOnInit(): void {
    this.Sub$.add(
      this.dataSrv.ListIdChg$.subscribe((listId) => {
        listId ? (this.listIdIsEmpty = true) : '';
      })
    );
  }
  ngOnDestroy(): void {
    this.Sub$.unsubscribe();
  }

  openAddTask() {
    this.addTaskMode = !this.addTaskMode;
    if (!this.addTaskMode) {
      this.dataSrv.updateTaskList(this.createTaskModel());
    } else {
      this.taskform.reset();
    }
    // document.body.style.overflow = 'hidden';
    // this.popupSrv.addTaskOCPopUp(false);
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
