export interface TaskModel {
  id: number;
  dbId?: string;
  listID: number;
  task: string;
  taskinfo?: string;
  date: string;
  author: string;
  status: string;
  currentStatus: number;
  editMode: boolean;
  color: string;
  isCheckBox: boolean;
  seeInfo: boolean;
  didIt: boolean;
}
