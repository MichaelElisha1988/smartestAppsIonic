import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'user-header',
  templateUrl: './user-header.component.html',
  styleUrls: ['./user-header.component.scss'],
  standalone: true,
  imports: [CommonModule],
})
export class UserHeaderComponent implements OnInit, AfterViewInit {
  todayDate: Date = new Date();
  loginName: string = localStorage.getItem('login')
    ? JSON.parse(localStorage.getItem('login')!).email.split('@')[0]
    : 'No Username Found';

  constructor(private dataSrv: DataService) {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.dataSrv.setDateString(new Date().toString());
  }
}
