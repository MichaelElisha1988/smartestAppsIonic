import { animate, style, transition, trigger } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { MeasureOptionComponent } from './components/measure-option/measure-option.component';
import { GeneralDataService } from 'src/app/services/general-data.service';

@Component({
  selector: 'app-measurements',
  templateUrl: './measurements.component.html',
  styleUrls: ['./measurements.component.scss'],
  standalone: true,
  imports: [CommonModule, MeasureOptionComponent],
  animations: [
    trigger('fade', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('0.3s', style({ opacity: 1 })),
      ]),
      transition(':leave', [animate('0.3s', style({ opacity: 0 }))]),
    ]),
  ],
})
export class MeasurementsComponent implements OnInit {
  dataStore = inject(GeneralDataService).appDataStore;

  constructor() {}

  ngOnInit() {}
}
