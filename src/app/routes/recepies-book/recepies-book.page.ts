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
import { Meal, MealModel } from 'src/app/models/meal.model';

@Component({
  selector: 'app-recepies-book',
  templateUrl: './recepies-book.page.html',
  styleUrls: ['./recepies-book.page.scss'],
  standalone: true,
  imports: [IonContent, CommonModule, FormsModule, ReactiveFormsModule],
})
export class RecepiesBookPage implements OnInit {
  searchForm = new FormGroup({
    search: new FormControl('', { updateOn: 'change' }),
    searchMeal: new FormControl(null, { updateOn: 'change' }),
  });

  recipiesSrv = inject(RecipiesDataService);
  notFav: boolean = false;
  searchFormStatusEffect = toSignal(this.searchForm.statusChanges);
  searchFormValueEffect = toSignal(this.searchForm.valueChanges);

  selectedMeal = signal<Meal | null>(null);
  addTofavorite: any;
  deleteFromFavorite: any;
  ViewuserDetail: any;
  searchMealsInStok = signal<Meal[]>([]);
  favoriteMealList: any;
  tenMealsInStok: any;

  constructor() {
    effect(() => {
      if (
        this.searchFormValueEffect() &&
        this.searchFormValueEffect()!.search &&
        this.searchFormValueEffect()!.search!.length >= 2
      ) {
        console.log('Search Form Value:', this.searchFormValueEffect()?.search);
        this.recipiesSrv
          .getMealByName(this.searchFormValueEffect()!.search!)
          .pipe(take(2))
          .subscribe((data) => {
            console.log('Search Results:', data.meals);
            this.searchMealsInStok.set(data.meals);
          });
      } else {
        this.searchMealsInStok.set([]);
      }
    });
    effect(() => {
      this.searchFormStatusEffect();
    });
  }

  ngOnInit() {}

  selectMeal(meal: MealModel) {
    console.log(meal);
  }
}
