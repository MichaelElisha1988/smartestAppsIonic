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
            // CHECK LOGIC: This iterates lists I SHARED. I AM THE OWNER.
            // Old Logic: hash(Recipient + Name)
            // New Logic: hash(Me + Name)
            // WE NEED TO SUPPORT BOTH temporarily or just SWITCH?
            // The "createSharedList" now uses hash(Me + Name).
            // So we should try to fetch from there.
            // But wait, "sharingEmails" contains lists I shared with "email".
            // If I upgraded, the list is at `hash(Me + Name)`.
            
            const myEmail = JSON.parse(localStorage.getItem('login')!).email;
            
            // Try New Key (Owner based)
            let collectionKey = shajs('sha256')
                .update(myEmail + nameList)
                .digest('hex');
            
            // Note: Since we didn't migrate old lists, they still live at `hash(recipient + name)`.
            // Ideally we check if that collection exists? Or we just assume new logic going forward?
            // "Try to figure this out" implies making it work.
            // Let's assume we look for the new one. If empty/not found, we could fallback, 
            // but `getDocs` just returns empty.
            // Complex Fallback: We can't legally know if it's old or new easily without metadata.
            // However, `nameList` is just a string here.
            
            this.sharedListIdRef = collection(
              this.DataBaseApp,
              `sharedListId${collectionKey}`
            );
            
            // Fallback for Backward Compatibility:
            // Since we didn't migrate, old lists are invisible if we only check new Key.
            // We should PROBABLY check both or sticking to Old Key for strings?
            // BUT `createSharedList` writes to New Key.
            
              return getDocs(this.sharedListIdRef!).then((data) => {
                 // If empty, it might be an OLD list (hash(recipient + name))
                 if(data.empty) {
                     const oldKey = shajs('sha256')
                        .update(email.allowedEmail + nameList)
                        .digest('hex');
                     const oldRef = collection(this.DataBaseApp, `sharedListId${oldKey}`);
                     return getDocs(oldRef).then(oldData => {
                         oldData.docs.forEach((d) => {
                            if (!tmpListId.find((x) => x.id === (d.data() as ListId).id)) {
                              tmpListId.push({ ...(d.data() as ListId), dbId: d.id });
                            }
                         });
                     });
                 }
                 
              data.docs.forEach((data) => {
                if (!tmpListId.find((x) => x.id === (data.data() as ListId).id)) {
                  tmpListId.push({
                    ...(data.data() as ListId),
                    dbId: data.id,
                  });
                }
              });
              return Promise.resolve();
            });
          })
        );
      });
      await Promise.all(sharingPromises);
    }

    if (this.sharedEmails() && this.sharedEmails().nameSharedLists.length > 0) {
      const sharedPromises = this.sharedEmails().nameSharedLists.map((listInfo: any) => {
        // listInfo can be string (Old) or {name, owner} (New)
        let ownerEmail = '';
        let listName = '';
        
        if (typeof listInfo === 'string') {
             // OLD FORMAT: We assume `hash(Me + Name)` because in old logic `sharedListId` was `hash(Recipient + Name)`.
             // Wait, if I am recipient: `hash(MyEmail + ListName)`.
             ownerEmail = JSON.parse(localStorage.getItem('login')!).email; 
             listName = listInfo;
        } else {
             // NEW FORMAT: We use the stored owner email.
             ownerEmail = listInfo.owner;
             listName = listInfo.name;
        }

        const collectionKey = shajs('sha256')
            .update(ownerEmail + listName)
            .digest('hex');

        this.sharedListIdRef = collection(
          this.DataBaseApp,
          `sharedListId${collectionKey}`
        );
        return getDocs(this.sharedListIdRef!).then((data) => {
          data.docs.forEach((data) => {
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
            const myEmail = JSON.parse(localStorage.getItem('login')!).email;
            const collectionKey = shajs('sha256').update(myEmail + nameList).digest('hex');
            
            this.sharedTaskListRef = collection(
                this.DataBaseApp, 
                `sharedTaskList${collectionKey}`
            );

          return getDocs(this.sharedTaskListRef!).then((data) => {
             // Fallback for Old style (hash(recipient + name))
             if(data.empty) {
                 const oldKey = shajs('sha256').update(email.allowedEmail + nameList).digest('hex');
                 const oldRef = collection(this.DataBaseApp, `sharedTaskList${oldKey}`);
                 return getDocs(oldRef).then(oldData => {
                     oldData.docs.forEach((d) => {
                        if(!tmpTaskList.find(x => x.id === (d.data() as TaskModel).id)){
                            tmpTaskList.push({ ...(d.data() as TaskModel), dbId: d.id });
                        }
                     });
                 });
             }

            data.docs.forEach((data) => {
               if(!tmpTaskList.find(x => x.id === (data.data() as TaskModel).id)){
                  tmpTaskList.push({
                    ...(data.data() as TaskModel),
                    dbId: data.id,
                  });
               }
            });
            return Promise.resolve();
          });
        })
      );
    });
    await Promise.all(sharingPromises);

    if (this.sharedEmails() && this.sharedEmails().nameSharedLists.length > 0) {
      const sharedPromises = this.sharedEmails().nameSharedLists.map((listInfo: any) => {
        let ownerEmail = '';
        let listName = '';

        if (typeof listInfo === 'string') {
             ownerEmail = JSON.parse(localStorage.getItem('login')!).email; 
             listName = listInfo;
        } else {
             ownerEmail = listInfo.owner;
             listName = listInfo.name;
        }

        const collectionKey = shajs('sha256').update(ownerEmail + listName).digest('hex');

        this.sharedTaskListRef = collection(
          this.DataBaseApp,
          `sharedTaskList${collectionKey}`
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

  createSharedList(listId: number, sheredWithEmails: string[]) {
    const shareListItem = this.listId().find((x) => x.id == listId);
    const allListTasks = this.taskList().filter((x) => {
      return x.listID == listId;
    });
    // Deep copy tasks to avoid mutating original immediately if needed, though they are being re-added
    let tmpTasktoSharedList = this.taskList().filter((x) => {
      return x.listID == listId;
    });

    // Delete Original List locally and from DB
    this.deleteList(this.selectedId(), allListTasks);

    // Update LOCAL list item properties for the new shared state
    if (shareListItem) {
      shareListItem.showSharedList = false;
      shareListItem.isShared = true;
      shareListItem.sharedWith = sheredWithEmails; // Now an array
      // sharedBy remains the current user (owner)
    }

    // 1. GENERATE SHARED COLLECTION KEYS based on OWNER (Me) + LIST NAME
    // This allows multiple people to access the SAME collection.
    const ownerEmail = JSON.parse(localStorage.getItem('login')!).email;
    const listHash = shajs('sha256')
      .update(`${ownerEmail}${shareListItem!.name}`)
      .digest('hex');

    this.sharedListIdRef = collection(
      this.DataBaseApp,
      `sharedListId${listHash}`
    );

    this.sharedTaskListRef = collection(
      this.DataBaseApp,
      `sharedTaskList${listHash}`
    );

    // 2. POPULATE THE SHARED COLLECTIONS
    addDoc(this.sharedListIdRef!, shareListItem);
    tmpTasktoSharedList.forEach((task) => {
      addDoc(this.sharedTaskListRef!, task);
    });

    // 3. GRANT ACCESS TO EACH RECIPIENT
    sheredWithEmails.forEach((targetEmail) => {
      // A. Update "SharingEmails" (My record of who I shared with)
      let tmpAllowedEmails: SharingEmail;
      let tmpOldAllowedEmails: SharingEmail | undefined | null =
        this.sharingEmails().find((x) => x.allowedEmail == targetEmail);

      if (tmpOldAllowedEmails) {
        // Recipient already exists in my sharing list, update them
        const dbIdSharingEmail = tmpOldAllowedEmails.dbId;
        if (dbIdSharingEmail) {
          const docSharingRef = doc(
            this.DataBaseApp,
            `sharingEmails${JSON.parse(localStorage.getItem('login')!).uid}`,
            dbIdSharingEmail
          );
          // Push new list name if not exists (check duplicates?)
          if (!tmpOldAllowedEmails.nameSharedLists.includes(shareListItem!.name)) {
             tmpOldAllowedEmails.nameSharedLists.push(shareListItem!.name);
             // We can just push the name because I AM THE OWNER.
             // When I verify what I shared, I know I own it.
             // When THEY verify, they look at "SharedEmails" collection which needs OWNER info.
          }
          
          updateDoc(docSharingRef, { ...tmpOldAllowedEmails });
        }
      } else {
        // New recipient, create record
        tmpAllowedEmails = {
          allowedEmail: targetEmail,
          nameSharedLists: [shareListItem!.name],
        };
        addDoc(this.sharingWithEmailsRef!, tmpAllowedEmails);
      }

      // B. Update "SharedEmails" (The RECIPIENT'S inbox of shared lists)
      const recipientSharedEmailsRef = collection(
        this.DataBaseApp,
        `sharedEmails${shajs('sha256').update(`${targetEmail}`).digest('hex')}`
      );

      // We need to check if the recipient already has a 'SharedEmails' doc
      // Since we can't easily query their specific doc without ID, we rely on having fetching it if possible, 
      // BUT we can't fetch THEIR data easily without a query.
      // Wait, the original code did `getDocs` on `sharedEmailsRef` but that was for MY shared emails.
      // To update THEIRS, we effectively blindly `addDoc` or we need a way to know their ID?
      // The original code did: `addDoc(this.sharedEmailsRef!, newSharedEmails)` where sharedEmailsRef was targetEmail hashed.
      // If we blindly addDoc, they might get duplicates. 
      // IMPROVEMENT: Query their collection to see if a doc exists?
      // For now, to match original logic style (which seemed to assume 1 doc or add new):
      // Actually original logic checked `if (this.sharingEmails().find...)` -> that checks MY list.
      // It did NOT check the recipient's DB state properly? 
      // Original: 
      /*
         this.sharedEmailsRef = collection(..., targetEmail hash);
         if (this.sharingEmails().find... targetEmail ...) { 
            // This logic implies: If I have shared with them before, I assume they have a doc?
            // But I don't know the ID of THEIR doc in THEIR collection unless I stored it?
            // The original code tried to access `this.sharedEmails()?.dbId` which is WRONG (that's MY shared lists).
         }
      */
      // CORRECT LOGIC: Query the recipient's `sharedEmails` collection to find the single config doc (if exists).
      // Since we can't easily wait/query inside this loop for everything without slowing down, 
      // AND existing logic was a bit flawsy, we will try to just ADD access.
      // Better approach used by Firestore typically: Each user has a `sharedWithMe` collection. We add a doc per list.
      // Current structure: `sharedEmails` collection has ONE doc with an array `nameSharedLists`.
      
      // We will perform a `getDocs` on the Recipient's collection to find the main doc.
      getDocs(recipientSharedEmailsRef).then(snapshot => {
          if (!snapshot.empty) {
             // Update existing doc
             const docId = snapshot.docs[0].id;
             const existingData = snapshot.docs[0].data() as SharedEmail;
             const newEntry = { name: shareListItem!.name, owner: ownerEmail }; // NEW DATA STRUCTURE
             
             // Check duplicates
             const exists = existingData.nameSharedLists.find((x: any) => 
                 (typeof x === 'string' ? x : x.name) === shareListItem!.name && 
                 (typeof x === 'string' ? true : x.owner === ownerEmail) // Legacy string check
             );

             if(!exists) {
                 existingData.nameSharedLists.push(newEntry);
                 const docRef = doc(this.DataBaseApp, `sharedEmails${shajs('sha256').update(`${targetEmail}`).digest('hex')}`, docId);
                 updateDoc(docRef, { nameSharedLists: existingData.nameSharedLists });
             }
          } else {
             // Create new doc
             const newEntry = { name: shareListItem!.name, owner: ownerEmail };
             addDoc(recipientSharedEmailsRef, { nameSharedLists: [newEntry] });
          }
      });
    });

    // 4. REFRESH LOCAL STATE
    this.getSharingEmails();
    this.getSharedEmails(); // My shared lists
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
