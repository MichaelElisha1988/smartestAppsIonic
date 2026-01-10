import { signalStore, withState, withMethods, patchState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tap } from 'rxjs';
import {
  ActionItem,
  MeasureStatus,
  menuStatus,
} from '../models/homeData.model';
import { FormGroup, FormControl } from '@angular/forms';
import { Meal } from '../models/meal.model';

export interface smartestAppsState {
  loader: boolean;
  measureStatus: { action: ActionItem | null; status: MeasureStatus };
  menuStatus: menuStatus;
  measureForm: FormGroup<{
    measureNum: FormControl<string>;
    measurment: FormControl<string>;
    density: FormControl<string>;
  }>;
  login$: any; // Placeholder for login observable
  loginError: string; // Placeholder for login error observable
  afterlogin$: any; // Placeholder for after login subject
  favoriteMealList: { dbId?: string; id: number; name: string }[];
  selectedMeal: Meal | null;
}

const initialState: smartestAppsState = {
  loader: false,
  measureStatus: { action: null, status: MeasureStatus.HOME },
  menuStatus: menuStatus.MEASURE,
  measureForm: new FormGroup({
    measureNum: new FormControl('', { nonNullable: true }),
    measurment: new FormControl('', { nonNullable: true }),
    density: new FormControl('', { nonNullable: true }),
  }),
  login$: localStorage.getItem('login')
    ? JSON.parse(localStorage.getItem('login')!)
    : null,
  loginError: '',
  afterlogin$: localStorage.getItem('login') ? true : false,
  favoriteMealList: [], // Initialize with an empty array
  selectedMeal: null, // Initialize with null
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
    setLoginError: rxMethod<string>((errorMsg) =>
      errorMsg.pipe(
        tap((errorMsg) => patchState(store, { loginError: errorMsg }))
      )
    ),
    setFavoriteMealList: rxMethod<
      { dbId?: string; id: number; name: string }[]
    >((MealList) =>
      MealList.pipe(
        tap((MealList) => patchState(store, { favoriteMealList: MealList }))
      )
    ),
    showLoader: rxMethod<boolean>((show) =>
      show.pipe(tap((show) => patchState(store, { loader: show })))
    ),
    setSelectedMeal: rxMethod<Meal | null>((meal) =>
      meal.pipe(tap((meal) => patchState(store, { selectedMeal: meal })))
    ),
    setMenuStatus: rxMethod<menuStatus>((menuStatus) =>
      menuStatus.pipe(tap((menuStatus) => patchState(store, { menuStatus })))
    ),
  }))
);
