import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PopUpService {
  private readonly addTaskSubject = new BehaviorSubject<boolean>(true);
  readonly addTask$ = this.addTaskSubject.asObservable();

  constructor() {}

  addTaskOCPopUp(OC: boolean) {
    this.addTaskSubject.next(OC);
  }
}
