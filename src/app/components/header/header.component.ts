import { animate, style, transition, trigger } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { GeneralDataService } from 'src/app/services/general-data.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  standalone: true,
  imports: [CommonModule],
  animations: [
    trigger('openClose', [
      transition(':enter', [
        style({ opacity: 0, height: '0px' }),
        animate('0.3s', style({ opacity: 1, height: '*' })),
      ]),
      transition(':leave', [animate('0.3s', style({ opacity: 0, height: 0 }))]),
    ]),
  ],
})
export class HeaderComponent {
  isOpenBurger: boolean = false;
  router = inject(Router);
  appDataStore = inject(GeneralDataService).appDataStore;

  constructor() {}

  ngOnInit() {}

  relocate(nav: string) {
    this.isOpenBurger = false;
    this.router.navigate([nav]);
  }
}
