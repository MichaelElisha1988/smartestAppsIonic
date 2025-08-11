import { Component, inject, WritableSignal } from '@angular/core';
import { IonContent } from '@ionic/angular/standalone';
import { GeneralDataService } from '../../services/general-data.service';
import { HomeData, MeasureStatus } from '../../models/homeData.model';
import { MeasurementsComponent } from '../../components/measurements/measurements.component';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [IonContent, MeasurementsComponent],
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
export class HomePage {
  generalData: WritableSignal<HomeData> =
    inject(GeneralDataService).homeInnerData;
  dataStore = inject(GeneralDataService).appDataStore;

  constructor() {}

  onMeasureStatus(measureStatus: MeasureStatus) {
    this.dataStore.changeMeasureStatus({
      action: this.generalData().actions[measureStatus - 1],
      status: measureStatus,
    });
  }

  clearInsert() {
    this.dataStore.measureForm().reset();
  }
}
