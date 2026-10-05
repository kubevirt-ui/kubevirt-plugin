/** FolderSelect value for VMs not assigned to a named group. */
export const PROJECT_ROOT_FOLDER_VALUE = '';

/** SelectTypeahead option id for the project root folder (see `createItemId` in SelectTypeahead). */
export const PROJECT_ROOT_TYPEAHEAD_ITEM_ID = `select-typeahead-${PROJECT_ROOT_FOLDER_VALUE.replaceAll(' ', '-')}`;
