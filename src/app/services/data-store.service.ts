import { signalStore, withState, withMethods, patchState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tap } from 'rxjs';
import {
  ActionItem,
  MeasureStatus,
  menuStatus,
} from '../models/homeData.model';
import { FormGroup, FormControl } from '@angular/forms';

export interface smartestAppsState {
  count: number;
  measureStatus: { action: ActionItem | null; status: MeasureStatus };
  menuStatus: menuStatus;
  measureForm: FormGroup<{
    measureNum: FormControl<string>;
    measurment: FormControl<string>;
    density: FormControl<string>;
  }>;
  login$: any; // Placeholder for login observable
  loginError$: any; // Placeholder for login error observable
  afterlogin$: any; // Placeholder for after login subject
}

const initialState: smartestAppsState = {
  count: 0,
  measureStatus: { action: null, status: MeasureStatus.HOME },
  menuStatus: menuStatus.MEASURE,
  measureForm: new FormGroup({
    measureNum: new FormControl('', { nonNullable: true }),
    measurment: new FormControl('', { nonNullable: true }),
    density: new FormControl('', { nonNullable: true }),
  }),
  login$: null,
  loginError$: null,
  afterlogin$: null,
};

export const smartestAppsStore = signalStore(
  { providedIn: 'root' },
  withState<smartestAppsState>(initialState), // Define the initial state
  withMethods((store) => ({
    changeMeasureStatus: rxMethod<{
      action: ActionItem | null;
      status: MeasureStatus;
    }>((_) =>
      _.pipe(
        tap((measureStatus) => {
          patchState(store, {
            measureStatus: {
              action: measureStatus.action,
              status: measureStatus.status,
            },
          });
        })
      )
    ),
    setLogin: rxMethod<any>((user) =>
      user.pipe(tap((user) => patchState(store, { login$: user })))
    ),
    setAfterLogin: rxMethod<boolean>((afterLogin) =>
      afterLogin.pipe(
        tap((afterLogin) => patchState(store, { afterlogin$: afterLogin }))
      )
    ),
    setLoginError: rxMethod<any>((errorMsg) =>
      errorMsg.pipe(
        tap((errorMsg) => patchState(store, { loginError$: errorMsg }))
      )
    ),
    reset: rxMethod<void>((_) =>
      _.pipe(tap(() => patchState(store, { count: 0 })))
    ),
  }))
);
