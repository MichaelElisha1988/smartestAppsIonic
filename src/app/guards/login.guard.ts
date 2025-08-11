import { inject, Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { Observable } from 'rxjs';
import { smartestAppsStore } from '../services/data-store.service';

@Injectable({
  providedIn: 'root',
})
export class LoginGuard implements CanActivate {
  storeDara = inject(smartestAppsStore);
  constructor(private router: Router) {}
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    console.log('LoginGuard activated');
    console.log(this.storeDara.afterlogin$());
    if (this.storeDara.afterlogin$()) {
      return true;
    }
    sessionStorage.setItem('return', `/${route.url.toString()}`);
    this.router.navigate(['login']);

    return false;
  }
}
