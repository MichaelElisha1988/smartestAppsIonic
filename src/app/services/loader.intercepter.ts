// src/app/http-interceptors/auth-interceptor.ts
import { inject, Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
} from '@angular/common/http';
import { finalize, Observable } from 'rxjs';
import { smartestAppsStore } from './data-store.service';

@Injectable()
export class LoaderInterceptor implements HttpInterceptor {
  constructor() {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const loaderService = inject(smartestAppsStore);

    loaderService.showLoader(true);

    // If no token, send the original request
    return next
      .handle(req)
      .pipe(finalize(() => loaderService.showLoader(false)));
  }
}
