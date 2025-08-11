export enum MeasureStatus {
    HOME = 0,
    KITCHEN = 1,
    LENGHT = 2,
    TEMPERATURE = 3
}
export enum menuStatus {
    MEASURE = 0,
    RECIPIES = 1,
    TODOLIST = 2
}

export interface HomeData {
  title: string;

  actions: ActionItem[];
}

export interface ActionItem {
    title: string;
    desity?: {[key: string]: number}[];
    measurements: string[];
}
