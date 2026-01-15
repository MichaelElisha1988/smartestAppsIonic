import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { TaskModel } from '../models/task.model';
import { FirebaseApp } from 'firebase/app';
import {
  CollectionReference,
  addDoc,
  updateDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
} from 'firebase/firestore';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';
import { LoginService } from './login.service';
import shajs from 'sha.js';
import { ListId } from '../models/list-id.model';
import { SharingEmail, SharedEmail } from '../models/shared-email.model';
import { smartestAppsStore } from './data-store.service';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  taskList = signal<TaskModel[]>([]);
  listId = signal<ListId[]>([]);
  sharingEmails = signal<SharingEmail[]>([]);
  sharedEmails = signal<SharedEmail>({ nameSharedLists: [] });
  selectedId = signal<number>(0);
  favoriteMealList = signal<{ dbId?: string; id: number; name: string }[]>([]);

  fbDataBase: FirebaseApp;
  DataBaseApp: any;
  listIdRef: CollectionReference;
  sharedListIdRef: CollectionReference | null = null;
  taskListRef: CollectionReference;
  sharedTaskListRef: CollectionReference | null = null;
  favoriteMealRef: CollectionReference;
  sharingWithEmailsRef: CollectionReference;
  sharedEmailsRef: CollectionReference | null = null;
  loginName: string = '';
  todayDate: string = '';

  loginSrv = inject(LoginService);
  dataStore = inject(smartestAppsStore);
  router = inject(Router);

  constructor() {
    localStorage.getItem('login') ? '' : this.router.navigate(['']);
    // FIREBASE INITIALIZER
    this.fbDataBase = this.loginSrv.getfbDataBase();
    this.DataBaseApp = this.loginSrv.getDataBaseApp();
    /////////////////////////////////
    // CALLING DATABASE
    this.listIdRef = collection(
      this.DataBaseApp,
      `listId${JSON.parse(localStorage.getItem('login')!).uid}`
    );
    this.taskListRef = collection(
      this.DataBaseApp,
      `taskList${JSON.parse(localStorage.getItem('login')!).uid}`
    );
    this.sharingWithEmailsRef = collection(
      this.DataBaseApp,
      `sharingEmails${JSON.parse(localStorage.getItem('login')!).uid}`
    );

    this.favoriteMealRef = collection(
      this.DataBaseApp,
      `favoriteMealRef${JSON.parse(localStorage.getItem('login')!).uid}`
    );
    /////////////////////////////////////

    // GET FIRST DATA FIREBASE/SESSION
    this.initData();

    // Effect to persist selectedId to localStorage whenever it changes
    effect(() => {
      localStorage.setItem('selectedListId', this.selectedId().toString());
    });
  }

  async initData() {
    // 1. Fetch emails FIRST to know about shared lists
    await Promise.all([this.getSharingEmails(), this.getSharedEmails()]);

    // 2. Then fetch lists and tasks, now that we have sharing info
    await Promise.all([
      this.getListId(),
      this.getTaskList(),
      this.getFavoriteMealList(),
    ]);
  }

  getLoginName(): string {
    this.setLoginName(
      JSON.parse(localStorage.getItem('login')!).email.split('@')[0]
    );
    return JSON.parse(localStorage.getItem('login')!).email.split('@')[0];
  }

  async getListId() {
    let tmpListId: ListId[] = [];

    await getDocs(this.listIdRef!).then((data) => {
      data.docs.forEach((data) => {
        tmpListId.push({ ...(data.data() as ListId), dbId: data.id });
      });
    });

    if (this.sharingEmails().length > 0) {
      const sharingPromises = this.sharingEmails().map((email) => {
        return Promise.all(
          email.nameSharedLists.map((nameList) => {
            this.sharedListIdRef = collection(
              this.DataBaseApp,
              `sharedListId${shajs('sha256')
                .update(email.allowedEmail + nameList)
                .digest('hex')}`
            );
            return getDocs(this.sharedListIdRef!).then((data) => {
              data.docs.forEach((data) => {
                // Check duplicate before pushing
                if (!tmpListId.find((x) => x.id === (data.data() as ListId).id)) {
                  tmpListId.push({
                    ...(data.data() as ListId),
                    dbId: data.id,
                  });
                }
              });
            });
          })
        );
      });
      await Promise.all(sharingPromises);
    }

    if (this.sharedEmails() && this.sharedEmails().nameSharedLists.length > 0) {
      const sharedPromises = this.sharedEmails().nameSharedLists.map((listName) => {
        this.sharedListIdRef = collection(
          this.DataBaseApp,
          `sharedListId${shajs('sha256')
            .update(
              JSON.parse(localStorage.getItem('login')!).email + listName
            )
            .digest('hex')}`
        );
        return getDocs(this.sharedListIdRef!).then((data) => {
          data.docs.forEach((data) => {
             // Check duplicate before pushing
             if (!tmpListId.find((x) => x.id === (data.data() as ListId).id)) {
                tmpListId.push({ ...(data.data() as ListId), dbId: data.id });
             }
          });
        });
      });
      await Promise.all(sharedPromises);
    }

    this.listId.set(tmpListId);
    
    // Initialize persistence logic here if needed, or rely on component
    const savedId = localStorage.getItem('selectedListId');
    if (savedId) {
       // Use loose equality match to handle string vs number issues
       const found = tmpListId.find(l => l.id == (savedId as any));
       if (found) {
           this.selectedId.set(found.id);
       } else if (tmpListId.length > 0) {
           this.selectedId.set(tmpListId[0].id);
       }
    } else if (tmpListId.length > 0) {
        this.selectedId.set(tmpListId[0].id);
    }
  }

  async getFavoriteMealList() {
    let tmpFavoriteMealList: { dbId?: string; id: number; name: string }[] = [];

    await getDocs(this.favoriteMealRef!).then((data) => {
      data.docs.forEach((data) => {
        tmpFavoriteMealList.push({
          ...(data.data() as { dbId?: string; id: number; name: string }),
          dbId: data.id,
        });
      });
    });

    this.favoriteMealList.set(tmpFavoriteMealList);
    this.dataStore.setFavoriteMealList(tmpFavoriteMealList);
  }

  async getTaskList() {
    let tmpTaskList: TaskModel[] = [];

    await getDocs(this.taskListRef!).then((data) => {
      data.docs.forEach((data) => {
        tmpTaskList.push({ ...(data.data() as TaskModel), dbId: data.id });
      });
    });

    const sharingPromises = this.sharingEmails().map((email) => {
      return Promise.all(
        email.nameSharedLists.map((nameList) => {
          this.sharedTaskListRef = collection(
            this.DataBaseApp,
            `sharedTaskList${shajs('sha256')
              .update(email.allowedEmail + nameList)
              .digest('hex')}`
          );
          return getDocs(this.sharedTaskListRef!).then((data) => {
            data.docs.forEach((data) => {
               if(!tmpTaskList.find(x => x.id === (data.data() as TaskModel).id)){
                  tmpTaskList.push({
                    ...(data.data() as TaskModel),
                    dbId: data.id,
                  });
               }
            });
          });
        })
      );
    });
    await Promise.all(sharingPromises);

    if (this.sharedEmails() && this.sharedEmails().nameSharedLists.length > 0) {
      const sharedPromises = this.sharedEmails().nameSharedLists.map((listname) => {
        this.sharedTaskListRef = collection(
          this.DataBaseApp,
          `sharedTaskList${shajs('sha256')
            .update(
              JSON.parse(localStorage.getItem('login')!).email + listname
            )
            .digest('hex')}`
        );

        return getDocs(this.sharedTaskListRef!).then((data) => {
          data.docs.forEach((data) => {
             if(!tmpTaskList.find(x => x.id === (data.data() as TaskModel).id)){
                tmpTaskList.push({
                  ...(data.data() as TaskModel),
                  dbId: data.id,
                });
             }
          });
        });
      });
      await Promise.all(sharedPromises);
    }

    this.taskList.set(tmpTaskList);
  }

  async getSharingEmails() {
    let tmpSharingEmails: SharingEmail[] = [];

    await getDocs(this.sharingWithEmailsRef!).then((data) => {
      data.docs.forEach((data) => {
        tmpSharingEmails.push({
          ...(data.data() as SharingEmail),
          dbId: data.id,
        });
      });
    });

    this.sharingEmails.set(tmpSharingEmails);
  }

  async getSharedEmails() {
    let tmpSharedEmails: SharedEmail | undefined;

    this.sharedEmailsRef = collection(
      this.DataBaseApp,
      `sharedEmails${shajs('sha256')
        .update(`${JSON.parse(localStorage.getItem('login')!).email}`)
        .digest('hex')}`
    );

    await getDocs(this.sharedEmailsRef!).then((data) => {
      data.docs.forEach((data) => {
        tmpSharedEmails = {
          nameSharedLists: [
            ...(tmpSharedEmails?.nameSharedLists || []),
            ...(data.data() as SharedEmail).nameSharedLists,
          ],
          dbId: data.id,
        };
      });
    });

    if (tmpSharedEmails) {
      this.sharedEmails.set(tmpSharedEmails);
    }
  }

  getDateString(): string {
    return this.todayDate;
  }

  getSelectedListId(): number {
    return this.selectedId();
  }

  setLoginName(logUser: string) {
    this.loginName = logUser;
  }

  setDateString(todayDate: string) {
    this.todayDate = todayDate;
  }

  setSelectedListId(id: number) {
    this.selectedId.set(id);
  }

  updateListId(name: string) {
    const listItem: ListId = {
      id: new Date().valueOf() * 2,
      name: name,
      editMode: false,
      listID: 0,
      showSharedList: true,
      isShared: false,
      sharedWith: '',
      sharedBy: localStorage.getItem('login')
        ? JSON.parse(localStorage.getItem('login')!).email
        : '',
    };
    addDoc(this.listIdRef!, listItem);
    this.listId.update(prev => [...prev, listItem]);
    localStorage.setItem(
      `listId${JSON.parse(localStorage.getItem('login')!).uid}`,
      JSON.stringify(this.listId())
    );
    this.getListId();
  }

  updateFavoriteMeal(name: string) {
    const meal: { dbId?: string; id: number; name: string } = {
      id: new Date().valueOf(),
      name: name,
    };
    addDoc(this.favoriteMealRef!, meal);
    localStorage.setItem(
      `listId${JSON.parse(localStorage.getItem('login')!).uid}`,
      JSON.stringify([...this.dataStore.favoriteMealList(), meal])
    );
    this.dataStore.setFavoriteMealList([
      ...this.dataStore.favoriteMealList(),
      meal,
    ]);
    this.getFavoriteMealList();
  }

  updateTaskList(task: TaskModel) {
    task.id = new Date().valueOf();
    task.listID = this.selectedId();
    const tmpListItem: ListId | undefined = this.listId().find(
      (x) => x.id == task.listID
    )
      ? this.listId().find((x) => x.id == task.listID)
      : undefined;

    if (!tmpListItem?.isShared) {
      addDoc(this.taskListRef!, task);
    } else {
      const colRef = collection(
        this.DataBaseApp,
        `sharedTaskList${shajs('sha256')
          .update(`${tmpListItem?.sharedWith}${tmpListItem?.name}`)
          .digest('hex')}`
      );
      addDoc(colRef!, task);
    }
    this.taskList.update(prev => [...prev, task]);
    this.getTaskList();
  }

  updateTaskData(task: TaskModel) {
    const tmpListItem: ListId | undefined = this.listId().find(
      (x) => x.id == task.listID
    );
    const dbId = this.taskList().find((x) => x.id == task.id)?.dbId;
    if (!dbId) {
      console.error('Invalid dbId for updateTaskData:', task);
      return;
    }
    if (!tmpListItem?.isShared) {
      const docRef = doc(
        this.DataBaseApp,
        `taskList${JSON.parse(localStorage.getItem('login')!).uid}`,
        dbId
      );
      updateDoc(docRef, { ...task });
    } else {
      const docRef = doc(
        this.DataBaseApp,
        `sharedTaskList${shajs('sha256')
          .update(`${tmpListItem?.sharedWith}${tmpListItem?.name}`)
          .digest('hex')}`,
        dbId
      );
      updateDoc(docRef, { ...task });
    }
    // Update local state implicitly or re-fetch (re-fetch is safer for now)
    this.getTaskList();
  }

  updateListData(list: ListId) {
    const dbId = this.listId().find((x) => x.id == list.id)?.dbId;
    if (!dbId) {
      console.error('Invalid dbId for updateListData:', list);
      return;
    }
    const docRef = doc(
      this.DataBaseApp,
      `listId${JSON.parse(localStorage.getItem('login')!).uid}`,
      dbId
    );
    updateDoc(docRef, { ...list });
    this.getListId();
  }

  deleteTask(id: number) {
    const dbId = this.taskList().find((x) => x.id == id)?.dbId;
    if (!dbId) {
      console.error('Invalid dbId for deleteTask:', id);
      return;
    }
    const tmpListItem: ListId | undefined = this.listId().find(
      (x) => x.id == this.selectedId()
    );
    if (!tmpListItem?.isShared) {
      const docRef = doc(
        this.DataBaseApp,
        `taskList${JSON.parse(localStorage.getItem('login')!).uid}`,
        dbId
      );
      deleteDoc(docRef);
    } else {
      const docRef = doc(
        this.DataBaseApp,
        `sharedTaskList${shajs('sha256')
          .update(`${tmpListItem?.sharedWith}${tmpListItem?.name}`)
          .digest('hex')}`,
        dbId
      );
      deleteDoc(docRef);
    }

    this.taskList.update(prev => prev.filter((x) => x.id != id));
  }

  deleteFavoriteMeal(mealName: string) {
    let dbId = this.dataStore
      .favoriteMealList()
      .find((favMeal) => favMeal.name == mealName)?.dbId;
    if (!dbId) {
      console.error('Invalid dbId for deleteFavoriteMeal:', mealName);
      return;
    }
    const docRef = doc(
      this.DataBaseApp,
      `favoriteMealRef${JSON.parse(localStorage.getItem('login')!).uid}`,
      dbId
    );
    deleteDoc(docRef);
    this.getFavoriteMealList();
  }

  deleteList(id: number, taskIds: TaskModel[]) {
    taskIds.forEach((x) => this.deleteTask(x.id));

    const tmpListIdItem = this.listId().find((item) => item.id == id);
    const dbId = this.listId().find((x) => x.id == id)?.dbId;
    if (!dbId) {
      console.error('Invalid dbId for deleteList:', id);
      return;
    }
    if (!tmpListIdItem?.isShared) {
      const docRef = doc(
        this.DataBaseApp,
        `listId${JSON.parse(localStorage.getItem('login')!).uid}`,
        dbId
      );
      deleteDoc(docRef);
    } else {
      let tmpAllowedEmails: SharingEmail;
      let tmpOldAllowedEmails: SharingEmail | undefined | null =
        this.sharingEmails().find((x) => {
          return x.allowedEmail == tmpListIdItem?.sharedWith;
        });

      if (tmpOldAllowedEmails) {
        const dbIdSharingEmail = this.sharingEmails().find((x) => {
          return x.allowedEmail == tmpListIdItem?.sharedWith;
        })?.dbId;
        if (dbIdSharingEmail) {
          const docSharingRef = doc(
            this.DataBaseApp,
            `sharingEmails${JSON.parse(localStorage.getItem('login')!).uid}`,
            dbIdSharingEmail
          );
          tmpOldAllowedEmails.nameSharedLists =
            tmpOldAllowedEmails.nameSharedLists.filter((sharedLists) => {
              return sharedLists != tmpListIdItem!.name;
            });
          tmpAllowedEmails = {
            allowedEmail: tmpListIdItem.sharedWith,
            nameSharedLists: tmpOldAllowedEmails.nameSharedLists,
          };
          tmpOldAllowedEmails.nameSharedLists.length == 0
            ? deleteDoc(docSharingRef)
            : updateDoc(docSharingRef, { ...tmpAllowedEmails });
        }
      }

      const docRef = doc(
        this.DataBaseApp,
        `sharedListId${shajs('sha256')
          .update(`${tmpListIdItem.sharedWith}${tmpListIdItem!.name}`)
          .digest('hex')}`,
        dbId
      );
      deleteDoc(docRef);
    }
    this.listId.update(prev => prev.filter((x) => x.id != id));
    
    // Select first list if one exists
    if(this.listId().length > 0) {
        this.selectedId.set(this.listId()[0].id);
    }
  }

  createSharedList(listId: number, sheredWithEmail: string) {
    const shareListItem = this.listId().find((x) => x.id == listId);
    const allListTasks = this.taskList().filter((x) => {
      return x.listID == listId;
    });
    let tmpTasktoSharedList = this.taskList().filter((x) => {
      return x.listID == listId;
    });
    this.deleteList(this.selectedId(), allListTasks);
    shareListItem
      ? ((shareListItem!.showSharedList = false),
        (shareListItem!.isShared = true),
        (shareListItem.sharedWith = sheredWithEmail))
      : '';

    let tmpAllowedEmails: SharingEmail;
    let tmpOldAllowedEmails: SharingEmail | undefined | null =
      this.sharingEmails().find((x) => {
        return x.allowedEmail == sheredWithEmail;
      });
    if (tmpOldAllowedEmails) {
      const dbIdSharingEmail = this.sharingEmails().find((x) => {
        return x.allowedEmail == sheredWithEmail;
      })?.dbId;
      if (dbIdSharingEmail) {
        const docSharingRef = doc(
          this.DataBaseApp,
          `sharingEmails${JSON.parse(localStorage.getItem('login')!).uid}`,
          dbIdSharingEmail
        );
        tmpOldAllowedEmails.nameSharedLists.push(shareListItem!.name);
        tmpAllowedEmails = {
          allowedEmail: sheredWithEmail,
          nameSharedLists: tmpOldAllowedEmails.nameSharedLists,
        };
        updateDoc(docSharingRef, { ...tmpAllowedEmails });
      }
    } else {
      tmpAllowedEmails = {
        allowedEmail: sheredWithEmail,
        nameSharedLists: [shareListItem!.name],
      };
      addDoc(this.sharingWithEmailsRef!, tmpAllowedEmails);
    }

    this.sharedEmailsRef = collection(
      this.DataBaseApp,
      `sharedEmails${shajs('sha256')
        .update(`${sheredWithEmail}`)
        .digest('hex')}`
    );

    if (
      this.sharingEmails() &&
      this.sharingEmails()?.length > 0 &&
      this.sharingEmails().find((x) => x.allowedEmail == sheredWithEmail)
    ) {
      const docSharedRef = doc(
        this.DataBaseApp,
        `sharedEmails${shajs('sha256')
          .update(`${sheredWithEmail}`)
          .digest('hex')}`,
        this.sharedEmails()?.dbId || ''
      );

      if (this.sharedEmails()?.dbId) {
        this.sharedEmails().nameSharedLists.push(shareListItem?.name!);
        updateDoc(docSharedRef, { ...this.sharedEmails() });
      }
    } else {
      const newSharedEmails = {
        nameSharedLists: [shareListItem?.name!],
      };
      // We can't update 'sharedEmails' signal directly with partial data easily due to type mismatch or logic complexity
      // but conceptually we are pushing to DB.
      // Re-fetching will sync the signal.
      addDoc(this.sharedEmailsRef!, newSharedEmails);
    }

    this.sharedListIdRef = collection(
      this.DataBaseApp,
      `sharedListId${shajs('sha256')
        .update(`${sheredWithEmail}${shareListItem!.name}`)
        .digest('hex')}`
    );

    this.sharedTaskListRef = collection(
      this.DataBaseApp,
      `sharedTaskList${shajs('sha256')
        .update(`${sheredWithEmail}${shareListItem!.name}`)
        .digest('hex')}`
    );

    addDoc(this.sharedListIdRef!, shareListItem);
    tmpTasktoSharedList.forEach((task) => {
      addDoc(this.sharedTaskListRef!, task);
    });

    this.getSharingEmails();
    this.getSharedEmails();
    this.getListId();
    this.getTaskList();
  }

  fordev() {
    console.log('for dev');
    console.log(this.sharingEmails());
    console.log(this.sharedEmails());
    console.log(this.listId());
    console.log(this.taskList());
    console.log(this.dataStore.favoriteMealList());
  }
}
