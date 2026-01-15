import { Component, OnInit, effect } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TaskModel } from 'src/app/models/task.model';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'task',
  templateUrl: './task.component.html',
  styleUrls: ['./task.component.scss'],
  standalone: true,
  imports: [CommonModule],
})
export class TaskComponent implements OnInit {
  taskList: TaskModel[] = [];
  shownList: TaskModel[] = [];
  expandTask: boolean = false;
  editTaskMode: boolean = false;
  isCheckBox: boolean = false;
  lastexpandTask: any = null;
  seeInfo: boolean = false;
  taskInfoSeen: TaskModel | null = null;

  taskNameEdit = new FormGroup({
    taskEdit: new FormControl('', {
      updateOn: 'blur',
      validators: [Validators.required],
    }),
  });

  constructor(private readonly dataSrv: DataService) {
    effect(() => {
        this.taskList = this.dataSrv.taskList();
    });

    effect(() => {
        const onChgSelection = this.dataSrv.selectedId();
        // Sort: Not Done first, then Done
        this.shownList = this.dataSrv.taskList()
        .filter((x) => x.listID == onChgSelection)
        .sort((a, b) => {
            if (a.didIt === b.didIt) return 0;
            return a.didIt ? 1 : -1;
        });

        setTimeout(() => {
        document
            .querySelectorAll<HTMLElement>('.effect-section')
            .forEach((task) => {
            const taskObj: TaskModel[] = this.taskList.filter((x) =>
                task.parentElement!.classList.contains(x.id + '')
            );
            if (taskObj.length > 0) {
                task.style.backgroundColor = '#' + taskObj[0].color;
                task.style.boxShadow = `0px 0px 35px #${taskObj[0].color}`;
            }
            });
        });
    });
  }

  ngOnInit(): void {}

  expand(event: any) {
  }
  didIt(event: any, task: TaskModel) {
    task.didIt = !task.didIt;
    this.dataSrv.updateTaskData(task);
  }

  taskDone(task: TaskModel) {
    task
      ? task?.currentStatus! >= 4
        ? (task.currentStatus = 1)
        : task.currentStatus!++
      : '';

    this.dataSrv.updateTaskData(task);
  }
  shownInfo(task: TaskModel) {
    this.taskList.forEach((x) => {
      x.seeInfo = false;
    });
    if (!this.taskInfoSeen) {
      this.taskInfoSeen = task!;
      this.taskInfoSeen.seeInfo = true;
    } else if (this.taskInfoSeen.id === task.id) {
      this.taskInfoSeen.seeInfo = false;
      this.taskInfoSeen = null;
    } else {
      this.taskInfoSeen.seeInfo = false;
      this.taskInfoSeen = task!;
      this.taskInfoSeen.seeInfo = true;
    }
  }
  closeTaskInfo(ev: any) {
    this.taskInfoSeen && !ev.target.classList.contains('i-icon-img')
      ? (this.taskInfoSeen.seeInfo = false)
      : '';
  }

  deleteTask(event: any) {
    this.dataSrv.deleteTask(event.target.attributes['taskId'].value);
  }

  editTaskName(event: any, task: TaskModel) {
    let taskParent: any = event;
    if (event.target.classList.contains('task-name')) {
      taskParent = event.target.parentElement;
    }

    setTimeout(() => {
      if ((taskParent as HTMLElement)?.children != undefined) {
        ((taskParent as HTMLElement).children[0] as HTMLInputElement).focus();
      } else {
        (taskParent.target.children[0] as HTMLInputElement).focus();
      }
    });
    task.editMode = true;
  }

  subbmitChange(ev: any, task: TaskModel) {
    if (task.task != ev.target.value && ev.target.value != '') {
      task.task = ev.target.value;
      task.editMode = false;
      this.dataSrv.updateTaskData(task);
    } else {
      task.editMode = false;
    }
  }
}
