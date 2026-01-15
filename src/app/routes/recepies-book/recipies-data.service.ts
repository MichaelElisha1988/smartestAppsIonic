import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Meal, MealModel } from 'src/app/models/meal.model';

@Injectable({
  providedIn: 'root',
})
export class RecipiesDataService {
  private baseURL: string = 'www.themealdb.com/api/json/v1/1/';
  private searchByNameOrLetters: string = 'search.php?s=';
  private searchByFirstLetter: string = 'search.php?f=';
  private searchById: string = 'lookup.php?i=';
  private searchRandomMeals: string = 'random.php';

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
}
