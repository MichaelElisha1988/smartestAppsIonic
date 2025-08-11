import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent } from '@ionic/angular/standalone';
import { Router } from '@angular/router';

@Component({
  selector: 'app-policy',
  templateUrl: './policy.page.html',
  styleUrls: ['./policy.page.scss'],
  standalone: true,
  imports: [IonContent, CommonModule, FormsModule],
})
export class PolicyPage implements OnInit {
  router = inject(Router);

  constructor() {}

  ngOnInit() {}

  relocate(nav: string) {
    this.router.navigate([nav]);
  }
}
