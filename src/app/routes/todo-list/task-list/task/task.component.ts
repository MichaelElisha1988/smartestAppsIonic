import { Component, OnInit, effect, signal } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TaskModel } from 'src/app/models/task.model';
import { DataService } from 'src/app/services/data.service';
import { TemplatesPopupComponent } from '../../popups/templates-popup/templates-popup.component';

@Component({
  selector: 'task',
  templateUrl: './task.component.html',
  styleUrls: ['./task.component.scss'],
  standalone: true,
  imports: [CommonModule, TemplatesPopupComponent],
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
  showTemplatesPopup = signal(false);

  taskNameEdit = new FormGroup({
    taskEdit: new FormControl('', {
      updateOn: 'blur',
      validators: [Validators.required],
    }),
  });

  private lastRefreshVal = 0;

  constructor(private readonly dataSrv: DataService) {
    effect(() => {
        this.taskList = this.dataSrv.taskList();
    });

    effect(() => {
        const onChgSelection = this.dataSrv.selectedId();
        const fullList = this.dataSrv.taskList();
        const currentRefreshVal = this.dataSrv.refreshTrigger();
        
        // 1. Filter for current list
        const freshList = fullList.filter((x) => x.listID == onChgSelection);

        // 2. Check if we need to Re-Sort (Structural Change OR Explicit Refresh)
        const isStructuralChange = 
            this.shownList.length !== freshList.length || 
            !this.shownList.every((t, i) => freshList.find(f => f.id === t.id));
        
        const isExplicitRefresh = currentRefreshVal !== this.lastRefreshVal;

        // Update tracking var if changed (using untracked/outside effect isn't safe inside?) 
        // Actually we can just update the property. Effects run in injection context but updating local prop is fine.
        if (isExplicitRefresh) {
             this.lastRefreshVal = currentRefreshVal;
        }

        if (isStructuralChange || isExplicitRefresh) {
            // Full Re-Render & Sort
            this.shownList = freshList.sort((a, b) => {
                if (a.didIt === b.didIt) return 0;
                return a.didIt ? 1 : -1;
            });
        } else {
            // Soft Update: Update properties in place, Maintain Order
            this.shownList = this.shownList.map(existing => {
                const fresh = freshList.find(f => f.id === existing.id);
                return fresh ? fresh : existing;
            });
        }

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
    }, { allowSignalWrites: true }); // Enable writing to lastRefreshVal if strict checking is on
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
    const id = parseInt(event.target.attributes['taskId'].value, 10);
    this.dataSrv.deleteTask(id);
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

  isHebrew(text: string): boolean {
    return /[\u0590-\u05FF]/.test(text);
  }
}
