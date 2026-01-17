import { Component, effect, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormControl,
  FormGroup,
  FormArray,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { IonContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { closeOutline } from 'ionicons/icons';
import { toSignal } from '@angular/core/rxjs-interop';
import { take } from 'rxjs';
import { RecipiesDataService } from './recipies-data.service';
import { Meal } from 'src/app/models/meal.model';
import { smartestAppsStore } from 'src/app/services/data-store.service';
import { DataService } from 'src/app/services/data.service';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-recepies-book',
  templateUrl: './recepies-book.page.html',
  styleUrls: ['./recepies-book.page.scss'],
  standalone: true,
  imports: [IonContent, CommonModule, FormsModule, ReactiveFormsModule, IonIcon],
})
export class RecepiesBookPage implements OnInit {
  searchForm = new FormGroup({
    search: new FormControl<string>('', { updateOn: 'change' }),
    searchMeal: new FormControl<number | null>(null, { updateOn: 'change' }),
  });
  router = inject(Router);
  recipiesSrv = inject(RecipiesDataService);
  dataStore = inject(smartestAppsStore);
  dataHttp = inject(DataService);
  http = inject(HttpClient); 
  loginEmail = signal<string>(JSON.parse(localStorage.getItem('login')!).email);
  selectedMealFollowedByEmail = signal<string>('');

  isShared = signal<boolean>(false);
  notFav: boolean = true;
  searchFormStatusEffect = toSignal(this.searchForm.statusChanges);
  searchMealValueEffect = toSignal(
    this.searchForm.controls.searchMeal.valueChanges
  );
  searchFormValueEffect = toSignal(this.searchForm.valueChanges);

  selectedMeal = signal<Meal | null>(null);
  searchMealsInStok = signal<Meal[]>([]);
  favoriteMealList = signal<Meal[]>([]);
  sharedMealList = signal<Meal[]>([]);
  foundMeals = signal<Meal[]>([]);
  showSearchPopup = signal<boolean>(false);
  followedSharedMealList = signal<{followedByEmail: string, mealList: Meal[]}[]>([]);
  tenMealsInStok: Meal[] = [];

  searchToFollowForm = new FormGroup({
    search: new FormControl<string>('', { validators: [Validators.required, Validators.email], updateOn: 'change' })
  });

  addRecipeForm = new FormGroup({
    strMeal: new FormControl('', Validators.required),
    strCategory: new FormControl('', Validators.required),
    strArea: new FormControl('', Validators.required),
    strInstructions: new FormControl('', Validators.required),
    strMealThumb: new FormControl(''),
    strTags: new FormControl(''),
    strYoutube: new FormControl(''),
    ingredients: new FormArray([])
  });
  isAddMode = signal(false);
  suggestedImages = signal<string[]>([]); // Store suggested image URLs
  
  // Wizard Step Control
  currentStep = signal(1);

  nextStep() {
      if (this.currentStep() === 1) {
          if (this.addRecipeForm.get('strMeal')?.valid && 
              this.addRecipeForm.get('strCategory')?.valid && 
              this.addRecipeForm.get('strArea')?.valid) {
              this.currentStep.set(2);
          } else {
              this.addRecipeForm.markAllAsTouched();
              alert('Please fill in all required fields (Name, Category, Area).');
          }
      } else if (this.currentStep() === 2) {
          if (this.ingredients.length > 0 && this.ingredients.valid) {
              this.currentStep.set(3);
          } else {
               alert('Please add at least one valid ingredient.');
          }
      }
  }

  publishToCommunity() {
    if(this.selectedMeal()?.isCustom != undefined){
      this.selectedMeal()!.published! = !this.selectedMeal()!.published!;
      this.recipiesSrv.publishMeal(this.selectedMeal()!, this.selectedMeal()!.published);
    }
  }

  prevStep() {
      if (this.currentStep() > 1) {
          this.currentStep.update(s => s - 1);
      }
  }

  searchToFollowFormSubmit() {
    console.log('Search submit triggered');
    const search = this.searchToFollowForm.value.search;
    console.log('Form status:', this.searchToFollowForm.status);
    console.log('Search Value:', search);
    
    if(this.searchToFollowForm.valid && search){
      console.log('Calling searchSharedList...');
      this.recipiesSrv.searchSharedList(search).then((res: any[]) => {
          console.log('Search result:', res);
          // res is array of arrays (one per email searched)
          if(res && res.length > 0 && res[0].length > 0) {
              this.foundMeals.set(res[0]);
              this.showSearchPopup.set(true);
          } else {
              this.foundMeals.set([]);
              console.log('No meals found for this user');
              // Maybe show toast? For now just log.
          }
      });
    } else {
      console.warn('Form invalid or empty search');
    }
  }

  closeSearchPopup() {
      this.showSearchPopup.set(false);
      this.foundMeals.set([]);
  }
  
  // Reset step on toggle
  toggleAddMode() {
      this.isAddMode.set(!this.isAddMode());
      this.currentStep.set(1);
  }

  // Getter for ingredients form array
  get ingredients() {
      return this.addRecipeForm.get('ingredients') as FormArray;
  }

  getSuggestions() {
      const mealName = this.addRecipeForm.get('strMeal')?.value;
      if (mealName && mealName.length > 2) {
          this.dataStore.showLoader(true);
          this.recipiesSrv.getSujestionsImages(mealName).pipe(take(1)).subscribe({
              next: (data) => {
                  if (data.items) {
                      const images = data.items?.map((image: any) => image?.link.includes('.jpg') || image?.link.includes('.png') ? image?.link : null).filter((image: any) => image !== null)
                      this.suggestedImages.set(images);
                  } else {
                      alert('No images found for this recipe name.');
                      this.suggestedImages.set([]);
                  }
                  this.dataStore.showLoader(false);
              },
              error: (err) => {
                  console.error(err);
                  this.dataStore.showLoader(false);
              }
          });
      } else {
          alert('Please enter a recipe name first.');
      }
  }

  selectSuggestion(url: string) {
      this.addRecipeForm.patchValue({ strMealThumb: url });
      this.suggestedImages.set([]); // Clear suggestions after selection
  }

  addIngredient() {
      const ingredientGroup = new FormGroup({
          ingredient: new FormControl('', Validators.required),
          measure: new FormControl('', Validators.required)
      });
      this.ingredients.push(ingredientGroup);
  }

  removeIngredient(index: number) {
      this.ingredients.removeAt(index);
  }

  constructor() {
    addIcons({ closeOutline });
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

    // LOAD FAVORITES (API + FIREBASE CUSTOM)
    effect(() => {
       const apiFavs = this.dataStore.favoriteMealList();
       this.refreshFavorites(apiFavs);
    }, { allowSignalWrites: true });

    // LOAD SHARED RECIPES (FIREBASE CUSTOM)
    effect(() => {
       const sharedList = this.dataStore.sharedMealList();
       this.refreshShared(sharedList);
    }, { allowSignalWrites: true });

    // LOAD FOLLOWED SHARED RECIPES (FIREBASE CUSTOM)
    effect(() => {
       const followedSharedList = this.dataStore.followedSharedMealList();
       this.followedSharedMealList.set(followedSharedList);
    }, { allowSignalWrites: true });
  }


  async refreshFavorites(favList: any[]) {
      this.favoriteMealList.set([]); 
      
      if (favList && favList.length > 0) {
          favList.forEach(favItem => {
              if (favItem.isCustom || favItem.strInstructions) {
                   this.favoriteMealList.update(list => {
                      if(!list.find(m => m.idMeal === favItem.idMeal)) {
                           return [...list, favItem as Meal];
                      }
                      return list;
                  });
              } else {
                   this.recipiesSrv
                  .getMealByName(favItem.name)
                  .pipe(take(1))
                  .subscribe((data) => {
                    if(data.meals && data.meals.length > 0) {
                       this.favoriteMealList.update(list => {
                           if(!list.find(m => m.idMeal === data.meals[0].idMeal)) {
                               return [...list, data.meals[0]];
                           }
                           return list;
                       });
                    }
                  });
              }
          });
      }
  }

  async refreshShared(sharedList: any[]) {
      this.sharedMealList.set([]); 
      
      if (sharedList && sharedList.length > 0) {
          sharedList.forEach(sharedItem => {
              if (sharedItem.isCustom || sharedItem.strInstructions) {
                   this.sharedMealList.update(list => {
                      if(!list.find(m => m.idMeal === sharedItem.idMeal)) {
                           return [...list, sharedItem as Meal];
                      }
                      return list;
                  });
              } else {
                   this.recipiesSrv
                  .getMealByName(sharedItem.name)
                  .pipe(take(1))
                  .subscribe((data) => {
                    if(data.meals && data.meals.length > 0) {
                       this.sharedMealList.update(list => {
                           if(!list.find(m => m.idMeal === data.meals[0].idMeal)) {
                               return [...list, data.meals[0]];
                           }
                           return list;
                       });
                    }
                  });
              }
          });
      }
  }

  addTofavorite() {
    if (this.selectedMeal()) {
      if(!this.favoriteMealList().find(m => m.idMeal === this.selectedMeal()!.idMeal)) {
           // Optimistic update
          this.favoriteMealList.update((list) => [
            ...list,
            this.selectedMeal() as Meal,
          ]);
    
          if (!this.isLocalRecipe(this.selectedMeal()!)) {
              this.dataHttp.updateFavoriteMeal(this.selectedMeal()!.strMeal);
          } else {
              // Should not happen for new adds of API meals, but if it's a custom meal being re-added?
              // Custom meals are added via saveCustomRecipe.
              // If I am viewing a custom meal (that I just saved), it is already in favorites.
          }
           this.notFav = false;
      }
    }
  }

  deleteFromFavorite() {
    if (this.selectedMeal()) {
      const mealToDelete = this.selectedMeal()!;
      
      this.favoriteMealList.update((list) =>
        list.filter((meal) => meal.idMeal !== mealToDelete.idMeal)
      );
      this.notFav = true;

      // Unify delete: By name (works for both API and Custom if strMeal/name aligns)
      this.dataHttp.deleteFavoriteMeal(mealToDelete.strMeal);
    }
  }

  isLocalRecipe(meal: Meal): boolean {
       // Helper to distinguish if needed, but primarily used to decide HOW to save.
       // API meals have isCustom=false (implied)
       return (meal as any).isCustom === true || meal.idMeal > 999999; 
  }

  async saveCustomRecipe() {
      if(this.addRecipeForm.valid) {
          const formVal = this.addRecipeForm.value;
          
          const ingredientsMap: any = {};
          const formIngredients = this.ingredients.value;
          
          for (let i = 0; i < 20; i++) {
              ingredientsMap[`strIngredient${i+1}`] = '';
              ingredientsMap[`strMeasure${i+1}`] = '';
              
              if (i < formIngredients.length) {
                   ingredientsMap[`strIngredient${i+1}`] = formIngredients[i].ingredient;
                   ingredientsMap[`strMeasure${i+1}`] = formIngredients[i].measure;
              }
          }

          const newMeal: Meal = {
              idMeal: new Date().getTime(), 
              strMeal: formVal.strMeal!,
              strCategory: formVal.strCategory!,
              strArea: formVal.strArea!,
              strInstructions: formVal.strInstructions!,
              isCustom: true,
              published: false,
              strMealThumb: formVal.strMealThumb || 'assets/custom-recipe.png', 
              strTags: formVal.strTags || '',
              strYoutube: formVal.strYoutube || '',
              ...ingredientsMap,
              
              strDrinkAlternate: null,
              strSource: null,
              strImageSource: '',
              strCreativeCommonsConfirmed: null,
              dateModified: null
          };

          // Save to Firebase directly
          this.dataHttp.updateFavoriteMeal(newMeal); // This now accepts Meal object

          this.favoriteMealList.update(list => [...list, newMeal]);
          
          this.isAddMode.set(false);
          this.addRecipeForm.reset();
          this.ingredients.clear();
      }
  }



  ngOnInit() {
    const mealList: Meal[] = [];
    for (let i = 0; i < 10; i++) {
      this.recipiesSrv.getRandomMeal().subscribe((data) => {
        mealList.push(data.meals[0]);
        i === 0 ? this.selectedMeal.set(data.meals[0]) : null;
      });
    }
    this.tenMealsInStok = mealList;
  }

  selectMeal(meal: Meal, isShared: boolean = false, selectedMealFollowedByEmail: string = this.loginEmail()) {
    this.selectedMeal.set(meal);
    this.isShared.set(isShared);
    this.selectedMealFollowedByEmail.set(selectedMealFollowedByEmail);
  }
  ViewuserDetail(selectedMeal: Meal) {
    this.dataStore.setSelectedMeal(selectedMeal);
    this.router.navigate(['/recepies-book', selectedMeal.idMeal]);
  }
}
