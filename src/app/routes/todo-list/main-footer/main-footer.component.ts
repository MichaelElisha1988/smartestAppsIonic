import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { DataService } from 'src/app/services/data.service';
import { PopUpService } from 'src/app/services/popups.service';

@Component({
  selector: 'main-footer',
  templateUrl: './main-footer.component.html',
  styleUrls: ['./main-footer.component.scss'],
  standalone: true,
  imports: [CommonModule],
})
export class MainFooterComponent implements OnInit, OnDestroy {
  constructor(
    private readonly popupSrv: PopUpService,
    private readonly dataSrv: DataService
  ) {}
  listIdIsEmpty: boolean = false;
  Sub$ = new Subscription();

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
    document.body.style.overflow = 'hidden';
    this.popupSrv.addTaskOCPopUp(false);
  }
}
