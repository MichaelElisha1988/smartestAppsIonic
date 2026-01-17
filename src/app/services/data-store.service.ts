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
  favoriteMealList: (Meal | { dbId?: string; id: number; name: string })[];
  sharedMealList: (Meal | { dbId?: string; id: number; name: string })[];
  selectedMeal: Meal | null;
  followedEmails: string[];
  followedSharedMealList: {followedByEmail: string, mealList: Meal[]}[];
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
  sharedMealList: [], // Initialize with an empty array
  selectedMeal: null, // Initialize with null
  followedEmails: localStorage.getItem('followedEmails')
    ? JSON.parse(localStorage.getItem('followedEmails')!)
    : [],
  followedSharedMealList: [],
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
          store.measureForm().reset();
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
    setFollowedSharedMealList: rxMethod<{
      followedByEmail: string;
      mealList: any[];
    }[]>((mealList) =>
      mealList.pipe(
        tap((mealList) => patchState(store, { followedSharedMealList: mealList }))
      )
    ),
    setFollowedEmails: rxMethod<string[]>((emailUsers) =>
      emailUsers.pipe(
        tap((emailUsers) => patchState(store, { followedEmails: emailUsers }))
      )
    ),
    setLoginError: rxMethod<string>((errorMsg) =>
      errorMsg.pipe(
        tap((errorMsg) => patchState(store, { loginError: errorMsg }))
      )
    ),
    setFavoriteMealList: rxMethod<
      (Meal | { dbId?: string; id: number; name: string })[]
    >((MealList) =>
      MealList.pipe(
        tap((MealList) => patchState(store, { favoriteMealList: MealList }))
      )
    ),
    setSharedMealList: rxMethod<
      (Meal | { dbId?: string; id: number; name: string })[]
    >((MealList) =>
      MealList.pipe(
        tap((MealList) => patchState(store, { sharedMealList: MealList }))
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
