import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { HomeData } from '../models/homeData.model';
import { Header } from '../models/headerData.model';
import { smartestAppsStore } from './data-store.service';
import { DataService } from './data.service';

@Injectable({
  providedIn: 'root',
})
export class GeneralDataService {
  http = inject(HttpClient);
  appDataStore = inject(smartestAppsStore);
  homeInnerData = signal<HomeData>({ title: '', actions: [] });
  headerInnerData = signal<Header>({
    gtransIcon: '',
    accIcon: '',
    logoIcon: '',
    profile: { settings: {}, userName: '', profileIcon: '' },
  });

  constructor() {}

  getDataFromJson() {
    this.http.get<HomeData>('assets/homeInnerDate.json').subscribe((data) => {
      this.homeInnerData.set(data);
    });
    this.http.get<Header>('assets/headerInnerDate.json').subscribe((data) => {
      this.headerInnerData.set(data);
    });
  }
}
