export interface ListId {
  listID: number;
  id: number;
  dbId?: string;
  name: string;
  editMode: boolean;
  showSharedList: boolean;
  isShared: boolean;
  sharedWith: string;
}
