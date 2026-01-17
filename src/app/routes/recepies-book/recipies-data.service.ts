import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Meal, MealModel } from 'src/app/models/meal.model';
import { DataService } from 'src/app/services/data.service';
import { inject } from '@angular/core';
import { smartestAppsStore } from 'src/app/services/data-store.service';

@Injectable({
  providedIn: 'root',
})
export class RecipiesDataService {
  private baseURL: string = 'www.themealdb.com/api/json/v1/1/';
  private searchByNameOrLetters: string = 'search.php?s=';
  private searchByFirstLetter: string = 'search.php?f=';
  private searchById: string = 'lookup.php?i=';
  private searchRandomMeals: string = 'random.php';

  dataService = inject(DataService);
  appStore = inject(smartestAppsStore);

  constructor(private http: HttpClient) {}

  getRandomMeal(): Observable<MealModel> {
    return this.http.get<MealModel>(
      `https://www.themealdb.com/api/json/v1/1/${this.searchRandomMeals}`
    );
  }

  getMealByName(mealName: string): Observable<MealModel> {
    return this.http.get<MealModel>(
      `https://www.themealdb.com/api/json/v1/1/${this.searchByNameOrLetters}${mealName}`
    );
  }

  getSujestionsImages(image: string): Observable<any> {
    return this.http.get<any>(
      `https://www.googleapis.com/customsearch/v1?q=${image}&searchType=image&key=AIzaSyAl7BROPcHGHDZGPAMyqelhCg9hws3vMlA&cx=668dbb9f47ea04424`
    );
  }

  getSearchedByFirstLetter(letter: string): Observable<MealModel> {
    return this.http.get<MealModel>(
      `https://www.themealdb.com/api/json/v1/1/${this.searchByFirstLetter}${letter}`
    );
  }

  getSearchedById(id: string): Observable<MealModel> {
    return this.http.get<MealModel>(
      `https://www.themealdb.com/api/json/v1/1/${this.searchById}${id}`
    );
  }

  publishMeal(meal: Meal, published: boolean) {
    const mealInStore: Meal = (this.appStore.sharedMealList().find(m => m.name === meal.strMeal) as Meal);
    if(mealInStore){
      published  ? this.dataService.updateMySharedMeal(mealInStore, published) : this.dataService.deleteMySharedMeal(mealInStore);
    }
    else{
      this.dataService.updateMySharedMeal(meal, true);
    }
  }
  searchSharedList(mealName: string) {  
    return this.dataService.getFollowedSharedMealList([mealName], true);
  }
}
