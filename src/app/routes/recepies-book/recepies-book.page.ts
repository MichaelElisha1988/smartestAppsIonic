import { Component, effect, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { IonContent } from '@ionic/angular/standalone';
import { toSignal } from '@angular/core/rxjs-interop';
import { take } from 'rxjs';
import { RecipiesDataService } from './recipies-data.service';
import { Meal } from 'src/app/models/meal.model';
import { smartestAppsStore } from 'src/app/services/data-store.service';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-recepies-book',
  templateUrl: './recepies-book.page.html',
  styleUrls: ['./recepies-book.page.scss'],
  standalone: true,
  imports: [IonContent, CommonModule, FormsModule, ReactiveFormsModule],
})
export class RecepiesBookPage implements OnInit {
  searchForm = new FormGroup({
    search: new FormControl<string>('', { updateOn: 'change' }),
    searchMeal: new FormControl<number | null>(null, { updateOn: 'change' }),
  });

  recipiesSrv = inject(RecipiesDataService);
  dataStore = inject(smartestAppsStore);
  dataHttp = inject(DataService);
  notFav: boolean = true;
  searchFormStatusEffect = toSignal(this.searchForm.statusChanges);
  searchMealValueEffect = toSignal(
    this.searchForm.controls.searchMeal.valueChanges
  );
  searchFormValueEffect = toSignal(this.searchForm.valueChanges);

  selectedMeal = signal<Meal | null>(null);
  ViewuserDetail: any;
  searchMealsInStok = signal<Meal[]>([]);
  favoriteMealList = signal<Meal[]>([]);
  tenMealsInStok = signal<Meal[]>([]);

  constructor() {
    effect(() => {
      if (
        this.searchFormValueEffect() &&
        this.searchFormValueEffect()!.search &&
        this.searchFormValueEffect()!.search!.length >= 2
      ) {
        this.recipiesSrv
          .getMealByName(this.searchFormValueEffect()!.search!)
          .pipe(take(2))
          .subscribe((data) => {
            this.searchMealsInStok.set(data.meals);
          });
      } else {
        this.searchMealsInStok.set([]);
      }
    });
    effect(() => {
      if (this.searchMealValueEffect()) {
        this.selectedMeal.set(
          this.searchMealsInStok()[this.searchMealValueEffect()!]
        );
      }
    });
    effect(() => {
      this.favoriteMealList.set([]);
      for (let i = 0; i < this.dataStore.favoriteMealList().length; i++) {
        this.recipiesSrv
          .getMealByName(this.dataStore.favoriteMealList()[i].name)
          .pipe(take(1))
          .subscribe((data) => {
            this.favoriteMealList().push(data.meals[0]);
          });
      }
    });
  }

  addTofavorite() {
    if (this.selectedMeal()) {
      this.favoriteMealList.update((list) => [
        ...list,
        this.selectedMeal() as Meal,
      ]);

      this.dataHttp.updateFavoriteMeal(this.selectedMeal()!.strMeal);
      this.notFav = false;
    }
  }

  deleteFromFavorite() {
    if (this.selectedMeal()) {
      this.favoriteMealList.update((list) =>
        list.filter((meal) => meal.idMeal !== this.selectedMeal()!.idMeal)
      );

      this.dataHttp.deleteFavoriteMeal(this.selectedMeal()!.strMeal);
      this.notFav = true;
    }
  }

  ngOnInit() {
    this.dataStore.showLoader(true);
    for (let i = 0; i < 10; i++) {
      this.recipiesSrv
        .getRandomMeal()
        .pipe(take(1))
        .subscribe((data) => {
          this.tenMealsInStok().push(data.meals[0]);
          i === 0 ? this.selectedMeal.set(data.meals[0]) : null;
          if (this.tenMealsInStok().length === 10) {
            this.dataStore.showLoader(false);
          }
        });
    }
  }

  selectMeal(meal: Meal) {
    this.favoriteMealList().filter((m) => m.idMeal === meal.idMeal).length > 0
      ? (this.notFav = false)
      : (this.notFav = true);
    this.selectedMeal.set(meal);
  }
}
