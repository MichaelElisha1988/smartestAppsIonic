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
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';
import { LoginService } from './login.service';
import shajs from 'sha.js';
import { ListId } from '../models/list-id.model';
import { SharingEmail, SharedEmail } from '../models/shared-email.model';
import { smartestAppsStore } from './data-store.service';
import { Meal } from '../models/meal.model';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  taskList = signal<TaskModel[]>([]);
  listId = signal<ListId[]>([]);
  sharingEmails = signal<SharingEmail[]>([]);
  sharedEmails = signal<SharedEmail>({ nameSharedLists: [] });
  selectedId = signal<number>(0);
  favoriteMealList = signal<any[]>([]);
  refreshTrigger = signal<number>(0);

  fbDataBase!: FirebaseApp;
  DataBaseApp!: any;
  listIdRef!: CollectionReference;
  sharedListIdRef: CollectionReference | null = null;
  taskListRef!: CollectionReference;
  sharedTaskListRef: CollectionReference | null = null;
  favoriteMealRef!: CollectionReference;
  sharingWithEmailsRef!: CollectionReference;
  sharedEmailsRef: CollectionReference | null = null;
  loginName: string = '';
  todayDate: string = '';

  loginSrv = inject(LoginService);
  dataStore = inject(smartestAppsStore);
  router = inject(Router);

  constructor() {
    this.initRefs();
    
    // GET FIRST DATA FIREBASE/SESSION
    this.initData();

    // Effect to persist selectedId to localStorage whenever it changes
    effect(() => {
      localStorage.setItem('selectedListId', this.selectedId().toString());
    });
  }

  initRefs() {
     if (this.taskListRef) return; // Already initialized

     const loginData = localStorage.getItem('login');
     if (!loginData) return;
     
     this.fbDataBase = this.loginSrv.getfbDataBase();
     this.DataBaseApp = this.loginSrv.getDataBaseApp();
     const uid = JSON.parse(loginData).uid;

     this.listIdRef = collection(
      this.DataBaseApp,
      `listId${uid}`
     );
     this.taskListRef = collection(
      this.DataBaseApp,
      `taskList${uid}`
     );
     this.sharingWithEmailsRef = collection(
      this.DataBaseApp,
      `sharingEmails${uid}`
     );

     this.favoriteMealRef = collection(
      this.DataBaseApp,
      `favoriteMealRef${uid}`
     );
  }

  async initData() {
    this.initRefs();
    this.refreshTrigger.update(v => v + 1);
    
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
    this.initRefs();
    if (!this.listIdRef) return;

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
            const myEmail = JSON.parse(localStorage.getItem('login')!).email;
            let collectionKey = shajs('sha256')
                .update(myEmail + nameList)
                .digest('hex');
            
            this.sharedListIdRef = collection(
              this.DataBaseApp,
              `sharedListId${collectionKey}`
            );
            
              return getDocs(this.sharedListIdRef!).then((data) => {
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
                    firebaseCollectionKey: collectionKey
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
        let ownerEmail = '';
        let listName = '';
        
        if (typeof listInfo === 'string') {
             ownerEmail = JSON.parse(localStorage.getItem('login')!).email; 
             listName = listInfo;
        } else {
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
                tmpListId.push({ 
                    ...(data.data() as ListId), 
                    dbId: data.id,
                    firebaseCollectionKey: collectionKey
                });
             }
          });
        });
      });
      await Promise.all(sharedPromises);
    }

    this.listId.set(tmpListId);
    
    const savedId = localStorage.getItem('selectedListId');
    if (savedId) {
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
    this.initRefs();
    if (!this.favoriteMealRef) return;
    let tmpFavoriteMealList: any[] = [];

    await getDocs(this.favoriteMealRef!).then((data) => {
      data.docs.forEach((data) => {
        tmpFavoriteMealList.push({
          ...(data.data() as any),
          dbId: data.id,
        });
      });
    });

    this.favoriteMealList.set(tmpFavoriteMealList);
    this.dataStore.setFavoriteMealList(tmpFavoriteMealList);
  }

  async getTaskList() {
    this.initRefs();
    if (!this.taskListRef) return;
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
             if(data.empty) {
                 const oldKey = shajs('sha256').update(email.allowedEmail + nameList).digest('hex');
                 const oldRef = collection(this.DataBaseApp, `sharedTaskList${oldKey}`);
                 return getDocs(oldRef).then(oldData => {
                     oldData.docs.forEach((d) => {
                        if(!tmpTaskList.find(x => x.id === (d.data() as TaskModel).id)){
                            // SELF-HEALING: Force isShared metadata for legacy tasks
                            const t = d.data() as TaskModel;
                            t.isShared = true;
                            t.sharedBy = myEmail;
                            t.ownerListName = nameList;
                            tmpTaskList.push({ ...t, dbId: d.id });
                        }
                     });
                 });
             }

            data.docs.forEach((data) => {
               if(!tmpTaskList.find(x => x.id === (data.data() as TaskModel).id)){
                  // SELF-HEALING: Force isShared metadata for legacy tasks
                  const t = data.data() as TaskModel;
                  t.isShared = true;
                  t.sharedBy = myEmail;
                  t.ownerListName = nameList;
                  tmpTaskList.push({
                    ...t,
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
                // SELF-HEALING: Force isShared metadata for legacy tasks
                const t = data.data() as TaskModel;
                t.isShared = true;
                t.sharedBy = ownerEmail;
                t.ownerListName = listName;
                tmpTaskList.push({
                  ...t,
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
    this.initRefs();
    if(!this.sharingWithEmailsRef) return;
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
    this.initRefs();
    if(!this.DataBaseApp) return;
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

  async updateListId(name: string) {
    this.initRefs();
    if (!this.listIdRef) return;

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
    await addDoc(this.listIdRef!, listItem);
    this.listId.update(prev => [...prev, listItem]);
    localStorage.setItem(
      `listId${JSON.parse(localStorage.getItem('login')!).uid}`,
      JSON.stringify(this.listId())
    );
    await this.getListId();
  }

  async updateFavoriteMeal(mealOrName: string | Meal) {
    this.initRefs();
    if (!this.favoriteMealRef) return;
    let mealToSave: any;

    if (typeof mealOrName === 'string') {
        // Legacy/API Name only
        mealToSave = {
            id: new Date().valueOf(),
            name: mealOrName,
            isCustom: false
        };
    } else {
        // Full Custom Meal Object
        mealToSave = {
            ...mealOrName,
            isCustom: true
            // Ensure id is present or generate one? Meal usually has idMeal.
        };
    }

    await addDoc(this.favoriteMealRef!, mealToSave);
    
    // Update Local State Optimistically
    const currentList = this.favoriteMealList();
    if (typeof mealOrName !== 'string') {
        mealToSave.name = mealOrName.strMeal; 
    }

    this.dataStore.setFavoriteMealList([...currentList, mealToSave]);
    await this.getFavoriteMealList();
  }

  async deleteFavoriteMeal(mealName: string) {
    this.initRefs();
    if (!this.favoriteMealRef) return;
    // We try to find by 'name' or 'strMeal'
    let dbId = this.dataStore
      .favoriteMealList()
      .find((favMeal: any) => (favMeal.name === mealName || favMeal.strMeal === mealName))?.dbId;
      
    if (!dbId) {
      console.error('Invalid dbId for deleteFavoriteMeal:', mealName);
      return;
    }
    const docRef = doc(
      this.DataBaseApp,
      `favoriteMealRef${JSON.parse(localStorage.getItem('login')!).uid}`,
      dbId
    );
    
    try {
        await deleteDoc(docRef);
        console.log('DeleteFavoriteMeal: Success', mealName);
    } catch (err) {
        console.error('DeleteFavoriteMeal: Failed', err);
    }
    
    // Updates
    const newList = this.favoriteMealList().filter(m => m.dbId !== dbId);
    this.favoriteMealList.set(newList);
    this.dataStore.setFavoriteMealList(newList);
  }

  async deleteList(id: number, taskIds: TaskModel[]) {
    this.initRefs();
    if (!this.listIdRef) return;

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
      const sharedWithList: string[] = Array.isArray(tmpListIdItem.sharedWith) 
          ? tmpListIdItem.sharedWith 
          : [tmpListIdItem.sharedWith];

      sharedWithList.forEach(email => {
          let tmpAllowedEmails: SharingEmail;
          let tmpOldAllowedEmails: SharingEmail | undefined | null =
            this.sharingEmails().find((x) => x.allowedEmail == email);
    
          if (tmpOldAllowedEmails) {
            const dbIdSharingEmail = tmpOldAllowedEmails.dbId;
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
                
              if(tmpOldAllowedEmails.nameSharedLists.length == 0) {
                   deleteDoc(docSharingRef);
              } else {
                   updateDoc(docSharingRef, { nameSharedLists: tmpOldAllowedEmails.nameSharedLists });
              }
            }
          }
      });

      const collectionKey = Array.isArray(tmpListIdItem.sharedWith) 
          ? shajs('sha256').update(`${tmpListIdItem.sharedBy}${tmpListIdItem.name}`).digest('hex')
          : shajs('sha256').update(`${tmpListIdItem.sharedWith}${tmpListIdItem.name}`).digest('hex');

      const docRef = doc(
        this.DataBaseApp,
        `sharedListId${collectionKey}`,
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

  async createSharedList(listId: number, sheredWithEmails: string[]) {
    this.initRefs();
    if (!this.listIdRef) return;

    const shareListItem = this.listId().find((x) => x.id == listId);
    const allListTasks = this.taskList().filter((x) => {
      return x.listID == listId;
    });
    // Deep copy tasks to avoid mutating original immediately if needed
    let tmpTasktoSharedList = this.taskList().filter((x) => {
      return x.listID == listId;
    });

    // Delete Original List locally and from DB
    await this.deleteList(this.selectedId(), allListTasks);

    // Update LOCAL list item properties for the new shared state
    if (shareListItem) {
      shareListItem.showSharedList = false;
      shareListItem.isShared = true;
      shareListItem.sharedWith = sheredWithEmails; // Now an array
    }

    // 1. GENERATE SHARED COLLECTION KEYS based on OWNER (Me) + LIST NAME
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
    await addDoc(this.sharedListIdRef!, shareListItem);
    tmpTasktoSharedList.forEach(async (task) => {
      await addDoc(this.sharedTaskListRef!, task);
    });

    // 3. GRANT ACCESS TO EACH RECIPIENT
    const promises = sheredWithEmails.map(async (targetEmail) => {
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
          if (!tmpOldAllowedEmails.nameSharedLists.includes(shareListItem!.name)) {
             tmpOldAllowedEmails.nameSharedLists.push(shareListItem!.name);
          }
          await updateDoc(docSharingRef, { ...tmpOldAllowedEmails });
        }
      } else {
        // New recipient, create record
        tmpAllowedEmails = {
          allowedEmail: targetEmail,
          nameSharedLists: [shareListItem!.name],
        };
        await addDoc(this.sharingWithEmailsRef!, tmpAllowedEmails);
      }

      // B. Update "SharedEmails" (The RECIPIENT'S inbox of shared lists)
      const recipientSharedEmailsRef = collection(
        this.DataBaseApp,
        `sharedEmails${shajs('sha256').update(`${targetEmail}`).digest('hex')}`
      );

      const snapshot = await getDocs(recipientSharedEmailsRef);
      if (!snapshot.empty) {
             // Update existing doc
             const docId = snapshot.docs[0].id;
             const existingData = snapshot.docs[0].data() as SharedEmail;
             const newEntry = { name: shareListItem!.name, owner: ownerEmail }; 
             
             // Check duplicates
             const exists = existingData.nameSharedLists.find((x: any) => 
                 (typeof x === 'string' ? x : x.name) === shareListItem!.name && 
                 (typeof x === 'string' ? true : x.owner === ownerEmail) 
             );

             if(!exists) {
                 existingData.nameSharedLists.push(newEntry);
                 const docRef = doc(this.DataBaseApp, `sharedEmails${shajs('sha256').update(`${targetEmail}`).digest('hex')}`, docId);
                 await updateDoc(docRef, { nameSharedLists: existingData.nameSharedLists });
             }
      } else {
             // Create new doc
             const newEntry = { name: shareListItem!.name, owner: ownerEmail };
             await addDoc(recipientSharedEmailsRef, { nameSharedLists: [newEntry] });
      }
    });

    await Promise.all(promises);

    // 4. REFRESH LOCAL STATE
    await this.getSharingEmails();
    await this.getSharedEmails(); 
    await this.getListId();
    await this.getTaskList(); 
  }

  async deleteTask(id: number) {
    this.initRefs();
    if (!this.taskListRef) return; 

    const task = this.taskList().find((task) => task.id == id);
    if (!task) {
        console.error('DeleteTask: Task not found in list', id);
        return; 
    }
    if (!task.dbId) {
        console.error('DeleteTask: Task missing dbId', task);
        return;
    }

    console.log('DeleteTask: Deleting task', id, 'Shared:', task.isShared);

    try {
        if (!task.isShared) {
            const docRef = doc(
                this.DataBaseApp,
                `taskList${JSON.parse(localStorage.getItem('login')!).uid}`,
                task.dbId
            );
            await deleteDoc(docRef);
            console.log('DeleteTask: Deleted private task');
        } else {
            const collectionKey = shajs('sha256')
                .update(
                `${task.sharedBy}${task.ownerListName}`
                )
                .digest('hex');

            const docRef = doc(
                this.DataBaseApp,
                `sharedTaskList${collectionKey}`,
                task.dbId
            );
            await deleteDoc(docRef);
            console.log('DeleteTask: Deleted shared task from key:', collectionKey);
        }
    } catch (err) {
        console.error('DeleteTask: Failed to delete doc', err);
    }
    
    this.taskList.update(prev => prev.filter((x) => x.id != id));
  }

  async updateTaskData(task: TaskModel) {
    // Sanitization: Remove undefined fields
    let taskToSave = JSON.parse(JSON.stringify(task));

    this.initRefs();
    if (!this.taskListRef) {
        console.error('Cannot update task: Database not initialized');
        return;
    }
    console.log('DataService: updateTaskData called.');
    console.log('DataService: Task isShared:', task.isShared);
    console.log('DataService: SharedBy:', task.sharedBy, 'OwnerList:', task.ownerListName);


    // OPTIMISTIC UPDATE: Update local UI immediately
    this.taskList.update(list => {
        const index = list.findIndex(t => t.id === task.id);
        if (index > -1) {
            // Update existing
            const newList = [...list];
            newList[index] = task;
            return newList;
        } else {
             // It's a new task being created, add it temporarily? 
             // MainFooter might normally handle UI, but here we enforce it.
             return [...list, task];
        }
    });

    try {
        if (!task.isShared) {
          if (task.dbId) {
            const docRef = doc(
              this.DataBaseApp,
              `taskList${JSON.parse(localStorage.getItem('login')!).uid}`,
              task.dbId
            );
            await updateDoc(docRef, { ...taskToSave });
          } else {
            await addDoc(this.taskListRef!, taskToSave);
            // New task: We need to pull back data to get the dbId
            this.getTaskList(); 
          }
        } else {
          const collectionKey = shajs('sha256')
            .update(`${task.sharedBy}${task.ownerListName}`)
            .digest('hex');
          this.sharedTaskListRef = collection(
            this.DataBaseApp,
            `sharedTaskList${collectionKey}`
          );

          if (task.dbId) {
            const docRef = doc(
              this.DataBaseApp,
              `sharedTaskList${collectionKey}`,
              task.dbId
            );
            await updateDoc(docRef, { ...taskToSave });
          } else {
            await addDoc(this.sharedTaskListRef!, taskToSave);
            // New task: We need to pull back data to get the dbId
            this.getTaskList();
          }
        }
    } catch (err: any) {
        console.error('Firestore Update Failed:', err);
        // Rollback? For now, we assume success.
    }
  }

  // --- TASK TEMPLATES (LocalStorage) ---

  getTemplates(): any[] {
      const stored = localStorage.getItem('taskTemplates');
      return stored ? JSON.parse(stored) : [];
  }

  saveTemplate(name: string, tasks: string[]) {
      const templates = this.getTemplates();
      const newTemplate = {
          id: new Date().getTime().toString(),
          name: name,
          tasks: tasks
      };
      templates.push(newTemplate);
      localStorage.setItem('taskTemplates', JSON.stringify(templates));
  }

  deleteTemplate(id: string) {
      const templates = this.getTemplates().filter((t: any) => t.id !== id);
      localStorage.setItem('taskTemplates', JSON.stringify(templates));
  }

  updateTemplate(updatedTemplate: any) {
      const templates = this.getTemplates();
      const index = templates.findIndex((t: any) => t.id === updatedTemplate.id);
      if (index !== -1) {
          templates[index] = updatedTemplate;
          localStorage.setItem('taskTemplates', JSON.stringify(templates));
      }
  }

  loadTemplateIntoList(templateId: string, targetListId: number) {
      const templates = this.getTemplates();
      const template = templates.find((t: any) => t.id === templateId);
      
      if (template && template.tasks) {
          template.tasks.forEach((taskTitle: string) => {
              const newTask: TaskModel = {
                listID: targetListId,
                id: new Date().valueOf() + Math.random(), // Ensure unique ID
                task: taskTitle,
                author: this.getLoginName(),
                date: this.getDateString(),
                status: "don't you forget",
                currentStatus: 1,
                editMode: false,
                seeInfo: false,
                color: Math.floor(Math.random() * 16777215).toString(16),
                isCheckBox: true,
                didIt: false,
              };
              
              // Add to local state immediately
              this.taskList.update(prev => [...prev, newTask]);
              
              // Save to DB (Fire and forget individual saves)
              this.updateTaskData(newTask); 
          });
      }
  }


  async updateListData(list: ListId, oldName?: string) {
    this.initRefs();
    if (list.dbId) {
      if (!list.isShared) {
        const docRef = doc(
          this.DataBaseApp,
          `listId${JSON.parse(localStorage.getItem('login')!).uid}`,
          list.dbId
        );
        await updateDoc(docRef, { ...list });
      } else {
        const nameForHash = oldName || list.name;
        // Fallback: If sharedBy is missing, use current user email
        const sharedBy = list.sharedBy || JSON.parse(localStorage.getItem('login')!).email;

        const computedKey = shajs('sha256')
          .update(`${sharedBy}${nameForHash}`)
          .digest('hex');
          
        // CRITICAL FIX: Prefer the original key stored at load time
        const collectionKey = list.firebaseCollectionKey || computedKey;
        
        console.log('UpdateListData: Updating Shared List. Key:', collectionKey);

        this.sharedListIdRef = collection(
          this.DataBaseApp,
          `sharedListId${collectionKey}`
        );
        
        const docRef = doc(
            this.DataBaseApp,
            `sharedListId${collectionKey}`,
            list.dbId
        );
        
        await updateDoc(docRef, { ...list, firebaseCollectionKey: collectionKey })
           .catch(e => console.error('UpdateListData: Failed to update shared list', e));
      }
    }
    await this.getListId();
  }

  // Alias for legacy calls or specific logic
  updateTaskList(task: TaskModel) {
      this.updateTaskData(task);
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
