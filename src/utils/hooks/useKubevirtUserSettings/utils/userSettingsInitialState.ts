const userSettingsInitialState: UserSettingsState = {
  ssh: {},
  columns: {},
  quickStart: {},
  cards: {},
};

export type UserSettingsState = {
  ssh: SSHUserSettings;
  columns: ColumnsUserSettings;
  quickStart: QuickStartUserSettings;
  cards: CardsUserSettings;
};

type SSHUserSettings = {
  [namespace: string]: string;
};

type ColumnsUserSettings = {
  [tableName: string]: string[];
};

type QuickStartUserSettings = {
  [guideName: string]: boolean;
};

type CardsUserSettings = {
  [cardPage: string]: { cardName: string; value: boolean };
};

export default userSettingsInitialState;
