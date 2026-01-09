import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent } from '@ionic/angular/standalone';
import { ListId } from 'src/app/models/list-id.model';
import { Meal } from 'src/app/models/meal.model';
import { TaskModel } from 'src/app/models/task.model';
import { DataService } from 'src/app/services/data.service';
import { smartestAppsStore } from 'src/app/services/data-store.service';

@Component({
  selector: 'app-recepie-item',
  templateUrl: './recepie-item.page.html',
  styleUrls: ['./recepie-item.page.scss'],
  standalone: true,
  imports: [IonContent, CommonModule, FormsModule],
})
export class RecepieItemPage implements OnInit {
  private dataSrv = inject(DataService);
  private dataStore = inject(smartestAppsStore);
  private loginName = this.dataSrv.getLoginName();

  recipie: Meal | null = this.dataStore.selectedMeal();

  get ingsLen(): number {
    if (!this.recipie) return 0;
    const ingredientKeys = Object.keys(this.recipie).filter((key) =>
      key.startsWith('strIngredient')
    );
    let count = 0;
    for (const key of ingredientKeys) {
      const value = (this.recipie as any)[key];
      if (value) count++;
    }
    return count;
  }
  id: number = 0;

  constructor() {}

  addIng(ingInfo: string, addIng: string) {
    let tmpListId: ListId[] = this.dataSrv.getListId();
    let shoppingListId = tmpListId.find((x: ListId) => {
      return x.name == 'shopping list';
    });

    this.dataStore.favoriteMealList().find((x) => {
      return x.name == this.recipie!.strMeal;
    })
      ? ''
      : this.dataSrv.updateFavoriteMeal(this.recipie!.strMeal);
    if (shoppingListId) {
      this.dataSrv.setSelectedListId(shoppingListId!.id);
      this.createTaskModel(ingInfo, addIng)
        ? this.dataSrv.updateTaskList(this.createTaskModel(ingInfo, addIng)!)
        : '';
    } else {
      this.dataSrv.updateListId('shopping list');
      tmpListId = this.dataSrv.getListId();
      shoppingListId = tmpListId.find((x: ListId) => {
        return x.name == 'shopping list';
      });
      this.dataSrv.setSelectedListId(shoppingListId!.id);
      this.createTaskModel(ingInfo, addIng)
        ? this.dataSrv.updateTaskList(this.createTaskModel(ingInfo, addIng)!)
        : '';
    }
  }

  createTaskModel(ingInfo: string, addIng: string): TaskModel | null {
    if (ingInfo && addIng) {
      let task = this.dataSrv.taskList.find((x) => {
        return x.task.toLowerCase() == addIng.toLowerCase();
      });
      if (task) {
        task.taskinfo =
          task.taskinfo + ',' + this.recipie!.strMeal + ' - ' + ingInfo;
        this.dataSrv.updateTaskData(task);
        return null;
      } else {
        return {
          listID: 0,
          id: 0,
          task: addIng ? addIng : '',
          taskinfo: this.recipie!.strMeal + ' - ' + ingInfo,
          author: this.loginName,
          date: new Date().getDate().toString(),
          status: 'false',
          currentStatus: 1,
          editMode: false,
          seeInfo: false,
          color: Math.floor(Math.random() * 16777215).toString(16),
          isCheckBox: true,
          didIt: false,
        };
      }
    }
    {
      alert(
        'Something went wrong, ingredient not added: ' + ingInfo + ', ' + addIng
      );
      return null;
    }
  }

  ngOnInit(): void {
    this.recipie ? null : location.replace('/recepies-book');
  }
}
