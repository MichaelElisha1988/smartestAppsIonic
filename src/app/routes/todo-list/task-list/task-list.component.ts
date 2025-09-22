import {
  AfterViewInit,
  Component,
  effect,
  ElementRef,
  inject,
  Input,
  OnInit,
  signal,
  ViewChild,
} from '@angular/core';
import {
  EmailValidator,
  FormControl,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
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
export class TaskListComponent implements OnInit, AfterViewInit {
  listId = signal<ListId[]>([]);
  selectedListId = signal(0);
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
      this.listId.set(listId);
    });

    effect(() => {
      if (this.listId.length > 0 && this.selectedListId() === 0) {
        this.selectedListId.set(0);
        this.dataSrv.setSelectedListId(this.listId()[0].id);
        this.selectListId(null, this.listId()[0], 0);
      }
    });
    effect(() => {
      this.showSharedList.set(this.listId()[this.selectedListId()]?.isShared);
    });
    effect(() => {
      if (this.listId().length > 0) {
        this.dataSrv.setSelectedListId(
          this.listId()[this.selectedListId()]?.id
        );
      } else {
        this.dataSrv.setSelectedListId(0);
      }
    });
  }

  ngOnInit(): void {}

  ngAfterViewInit(): void {}

  addListId(event: any) {
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

  selectListId(event: any, list: ListId, index: number) {
    this.selectedListId.set(index);
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
      list.editMode = true;
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
      list.editMode = false;
      this.dataSrv.updateListData(list);
    } else {
      list.editMode = false;
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
    let listId = this.getSelectedListId();
    this.showSharedList.set(false);
    this.dataSrv.createSharedList(
      listId,
      this.shareWithEmail.value!.toLocaleLowerCase()
    );
  }
}
