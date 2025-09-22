import { trigger, transition, style, animate } from '@angular/animations';
import { Component, inject, OnInit } from '@angular/core';
import { smartestAppsStore } from 'src/app/services/data-store.service';

@Component({
  selector: 'app-loader',
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.scss'],
  animations: [
    trigger('openClose', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('0.3s', style({ opacity: 1 })),
      ]),
      transition(':leave', [animate('0.3s', style({ opacity: 0 }))]),
    ]),
  ],
})
export class LoaderComponent implements OnInit {
  dataStore = inject(smartestAppsStore);

  constructor() {}

  ngOnInit() {}
}
