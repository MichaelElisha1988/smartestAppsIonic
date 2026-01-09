import {
  Component,
  effect,
  ElementRef,
  inject,
  signal,
  viewChild,
  ViewChild,
} from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TaskComponent } from './task/task.component';
import { ListId } from 'src/app/models/list-id.model';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'task-list',
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TaskComponent],
})
export class TaskListComponent {
  listId = signal<ListId[]>([]);
  selectedListIndex = signal(0);
  addActive = signal(false);
  listEdit = signal(false);
  movearound = signal(0);
  showSharedList = signal(false);
  shareWithEmail = new FormControl<string>('', [
    Validators.required,
    Validators.email,
  ]);

  @ViewChild('addInput') addInput: ElementRef | undefined;

  private readonly dataSrv = inject(DataService);

  constructor() {
    this.dataSrv.ListId$.subscribe((listId) => {
      setTimeout(() => {
        this.listId.set(listId);
        this.selectedListIndex.set(0);
        this.dataSrv.setSelectedListId(this.listId()[0]?.id);
      }, 1000);
    });
    effect(() => {
      if (this.listId().length > 0) {
        this.selectedListIndex.set(0);
        this.dataSrv.setSelectedListId(this.listId()[0]?.id);
      }
    });
    effect(() => {
      this.showSharedList.set(
        this.listId()[this.selectedListIndex()]?.isShared
      );
    });
    effect(() => {
      if (this.listId().length > 0) {
        this.dataSrv.setSelectedListId(
          this.listId()[this.selectedListIndex()]?.id
        );
      }
    });
  }

  addListId() {
    if (!this.addActive()) {
      this.addInput!.nativeElement.value = '';
      this.addActive.set(true);
    } else {
      this.addActive.set(false);
      this.addInput!.nativeElement.value != ''
        ? this.dataSrv.updateListId(this.addInput!.nativeElement.value)
        : '';
    }
  }

  getSelectedListId(): number {
    return this.dataSrv.getSelectedListId();
  }

  selectListId(event: any, index: number) {
    this.selectedListIndex.set(index);
    this.dataSrv.taskList.map((x) => {
      x.seeInfo = false;
    });
    let listParent: any = event;
    if (event.target.classList.contains('list-name')) {
      listParent = event.target.parentElement;
    }
    if (
      event.target.attributes['listId']?.value == this.getSelectedListId() ||
      +(listParent as HTMLElement)?.attributes?.getNamedItem('listId')
        ?.value! == this.getSelectedListId()
    ) {
      this.listEdit.set(true);
      setTimeout(() => {
        if ((listParent as HTMLElement)?.children != undefined) {
          ((listParent as HTMLElement).children[0] as HTMLInputElement).focus();
        } else {
          (listParent.target.children[0] as HTMLInputElement).focus();
        }
      });
    } else {
      if ((listParent as HTMLElement)?.children != undefined) {
        this.dataSrv.setSelectedListId(
          +(listParent as HTMLElement)?.attributes?.getNamedItem('listId')
            ?.value!
        );
      } else {
        this.dataSrv.setSelectedListId(
          event.target.attributes['listId']?.value
        );
      }
    }
  }

  updateListName(event: any, list: ListId) {
    if (list.name != event.target.value && event.target.value != '') {
      list.name = event.target.value;
      this.listEdit.set(false);
      this.dataSrv.updateListData(list);
    } else {
      this.listEdit.set(false);
    }
  }

  deleteList() {
    let listId = this.getSelectedListId();
    let taskIds = this.dataSrv.taskList.filter((x) => x.listID == listId);
    confirm(
      'You about to DELETE List named: ' +
        this.dataSrv.listId.find((x) => x.id == listId)?.name +
        ', Please Comfirm'
    )
      ? (console.log(listId, taskIds), this.dataSrv.deleteList(listId, taskIds))
      : '';
  }

  shareList() {
    if (
      !this.shareWithEmail.invalid &&
      this.shareWithEmail.value !=
        JSON.parse(localStorage.getItem('login')!).email
    ) {
      let listId = this.getSelectedListId();
      this.showSharedList.set(false);
      console.log(this.shareWithEmail.value!.toLocaleLowerCase());
      this.dataSrv.createSharedList(
        listId,
        this.shareWithEmail.value!.toLocaleLowerCase()
      );
      this.shareWithEmail.setValue('');
    } else {
      alert('Cannot share with this email');
    }
  }
  fordev() {
    this.dataSrv.fordev();
  }
}
