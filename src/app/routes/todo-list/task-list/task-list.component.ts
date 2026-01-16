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
import { smartestAppsStore } from 'src/app/services/data-store.service';


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
  isShareBoxVisible = signal(false);
  showSharedUsers = signal(false);
  showListActions = signal(false);
  recentSharedUsers = signal<string[]>([]);
  
  shareWithEmail = new FormControl<string>('', [
    Validators.required,
  ]);

  @ViewChild('addInput') addInput: ElementRef | undefined;
  private readonly appStore = inject(smartestAppsStore);
  private readonly dataSrv = inject(DataService);
  worstCaseLoader: any;
  constructor() {
    this.appStore.showLoader(true);
    
    // Load recent shared users
    const cachedUsers = localStorage.getItem('recentSharedUsers');
    if (cachedUsers) {
        this.recentSharedUsers.set(JSON.parse(cachedUsers));
    }

    this.worstCaseLoader = setTimeout(() => {
      this.appStore.showLoader(false);
    }, 5000);
    // Sync listId from service
    effect(() => {
        this.listId.set(this.dataSrv.listId());
    }, { allowSignalWrites: true });

    effect(() => {
      if (this.listId().length > 0) {
        // Find index based on selectedId from service
        const currentSelectedId = this.dataSrv.selectedId();
        const index = currentSelectedId ? this.listId().findIndex((x) => x.id == currentSelectedId) : 0;
        this.selectedListIndex.set(index >= 0 ? index : 0);
        
        // Ensure service has the correct ID (if index was corrected to 0)
        // this.dataSrv.setSelectedListId(this.listId()[this.selectedListIndex()]?.id);
        this.appStore.showLoader(false);
        clearTimeout(this.worstCaseLoader);
      }
    });

    effect(() => {
        const selectedList = this.listId()[this.selectedListIndex()];
        if(selectedList) {
             this.showSharedList.set(selectedList.isShared);
             // Ensure selectedID is synced if index changed
             // this.dataSrv.setSelectedListId(selectedList.id);
        }
    });
    
    // Explicit sync back to service if index changes? 
    // Actually the flow is: User clicks -> sets index -> logic sets service ID. 
    // OR: Service loads -> sets service ID -> effect sets index.
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
    return this.dataSrv.selectedId();
  }

  selectListId(event: any, index: number) {
    this.selectedListIndex.set(index);
    // Mutating the array inside the signal. Ideally should use update but for this property reset it's okay for now.
    // Better: this.dataSrv.taskList.update(tasks => tasks.map(t => ({...t, seeInfo: false})));
    // But keeping existing logic style:
    this.dataSrv.taskList().forEach((x) => {
      x.seeInfo = false;
    });
    
    let listParent: any = event;
    if (event.target.classList.contains('list-name')) {
      listParent = event.target.parentElement;
    }
    
    // We can rely on `index` directly since we just set it? 
    // The existing logic checks attributes. Let's keep it but access service ID via signal.
    const currentId = this.getSelectedListId();
    const clickedIdAttr = event.target.attributes['listId']?.value;
    const parentIdAttr = (listParent as HTMLElement)?.attributes?.getNamedItem('listId')?.value;
    
    if (
        clickedIdAttr == currentId ||
        +(parentIdAttr!) == currentId
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
        this.dataSrv.setSelectedListId(+parentIdAttr!);
      } else {
        this.dataSrv.setSelectedListId(clickedIdAttr);
      }
    }
  }

  updateListName(event: any, list: ListId) {
    if (list.name != event.target.value && event.target.value != '') {
      const oldName = list.name;
      list.name = event.target.value;
      this.listEdit.set(false);
      this.dataSrv.updateListData(list, oldName);
    } else {
      this.listEdit.set(false);
    }
  }

  deleteList() {
    let listId = this.getSelectedListId();
    let taskIds = this.dataSrv.taskList().filter((x) => x.listID == listId);
    confirm(
      'You about to DELETE List named: ' +
        this.dataSrv.listId().find((x) => x.id == listId)?.name +
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
      
      const emailInput = this.shareWithEmail.value || '';
      // Split by comma, trim whitespace, and filter empty strings
      const emails = emailInput.split(',').map(e => e.trim().toLowerCase()).filter(e => e.length > 0);
      
      console.log('Sharing with emails:', emails);
      if (emails.length > 0) {
          this.dataSrv.createSharedList(
            listId,
            emails
          );
          
          // Cache new emails
          const currentRecent = this.recentSharedUsers();
          const updatedRecent = [...new Set([...currentRecent, ...emails])];
          localStorage.setItem('recentSharedUsers', JSON.stringify(updatedRecent));
          this.recentSharedUsers.set(updatedRecent);

          this.shareWithEmail.setValue('');
      } else {
          alert('Please enter at least one valid email');
      }

    } else {
      alert('Cannot share with these emails');
    }
  }

  addEmailFromSuggestion(email: string) {
      let currentVal = this.shareWithEmail.value || '';
      
      // Parse existing emails
      let existingEmails = currentVal.split(',')
          .map(e => e.trim())
          .filter(e => e.length > 0);
      
      const emailLower = email.toLowerCase();
      const index = existingEmails.findIndex(e => e.toLowerCase() === emailLower);

      if (index !== -1) {
          // Remove if exists
          existingEmails.splice(index, 1);
      } else {
          // Add if not exists
          existingEmails.push(email);
      }
      
      // Reconstruct string
      this.shareWithEmail.setValue(existingEmails.join(', '));
  }

  fordev() {
    this.dataSrv.fordev();
  }
}
