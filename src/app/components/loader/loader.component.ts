import { Component, inject, OnInit } from '@angular/core';
import { smartestAppsStore } from 'src/app/services/data-store.service';

@Component({
  selector: 'app-loader',
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.scss'],
})
export class LoaderComponent implements OnInit {
  dataStore = inject(smartestAppsStore);

  constructor() {}

  ngOnInit() {}
}
