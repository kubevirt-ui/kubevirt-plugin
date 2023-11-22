const userSettingsInitialState: UserSettingsState = {
  cards: {},
  columns: {},
  quickStart: {},
  ssh: {},
};

export type UserSettingsState = {
  cards: CardsUserSettings;
  columns: ColumnsUserSettings;
  quickStart: QuickStartUserSettings;
  ssh: SSHUserSettings;
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
