import { bootstrapApplication } from '@angular/platform-browser';
import {
  RouteReuseStrategy,
  provideRouter,
  withPreloading,
  PreloadAllModules,
} from '@angular/router';
import {
  IonicRouteStrategy,
  provideIonicAngular,
} from '@ionic/angular/standalone';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { provideAnimations } from '@angular/platform-browser/animations';
import { GeneralDataService } from './app/services/general-data.service';

import { inject, provideAppInitializer } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';

export function initializeData(generalDataSrv: GeneralDataService): void {
  console.log('Initializing data from JSON');
  generalDataSrv.getDataFromJson();
}

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideRouter(routes, withPreloading(PreloadAllModules)),
    provideAnimations(),
    provideHttpClient(),
    provideAppInitializer(() => initializeData(inject(GeneralDataService))),
  ],
});
