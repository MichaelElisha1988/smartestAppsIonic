import { bootstrapApplication } from '@angular/platform-browser';
import {
  RouteReuseStrategy,
  provideRouter,
  withPreloading,
  PreloadAllModules,
  withHashLocation,
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
import {
  HTTP_INTERCEPTORS,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import { LoaderInterceptor } from './app/services/loader.intercepter';

export function initializeData(generalDataSrv: GeneralDataService): void {
  generalDataSrv.getDataFromJson();
}

import { HttpInterceptorFn } from '@angular/common/http';
import { finalize } from 'rxjs';
import { smartestAppsStore } from './app/services/data-store.service';

export const loaderInterceptor: HttpInterceptorFn = (req, next) => {
  const loaderService = inject(smartestAppsStore);
  loaderService.showLoader(true);

  return next(req).pipe(finalize(() => loaderService.showLoader(false)));
};

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideRouter(
      routes,
      withPreloading(PreloadAllModules),
      withHashLocation()
    ),
    provideAnimations(),
    provideHttpClient(withInterceptors([loaderInterceptor])),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: LoaderInterceptor,
      multi: true,
    },
    provideAppInitializer(() => initializeData(inject(GeneralDataService))),
  ],
});
