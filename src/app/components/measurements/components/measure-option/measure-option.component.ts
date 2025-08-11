import { trigger, transition, style, animate } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { Component, effect, inject, OnInit } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MeasurementsPipe } from 'src/app/pipes/measurements.pipe';
import { smartestAppsStore } from 'src/app/services/data-store.service';

@Component({
  selector: 'app-measure-option',
  templateUrl: './measure-option.component.html',
  styleUrls: ['./measure-option.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MeasurementsPipe],
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
export class MeasureOptionComponent implements OnInit {
  storeSrv = inject(smartestAppsStore);

  measureFormEffect = toSignal(this.storeSrv.measureForm().statusChanges);
  constructor() {
    effect(() => {
      this.measureFormEffect();
    });
  }

  ngOnInit() {}
}
