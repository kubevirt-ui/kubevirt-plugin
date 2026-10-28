import { type OnboardingPopoversHidden } from '@kubevirt-utils/components/OnboardingPopover/types';

export type UserSettingsState = {
  cards: CardsUserSettings;
  columns: ColumnsUserSettings;
  columnWidths: ColumnWidthsUserSettings;
  defaultVMLabels: DefaultVMLabelsUserSettings;
  favoriteBootableVolumes: string[];
  navigation: NavigationUserSettings;
  onboardingPopoversHidden: OnboardingPopoversHidden;
  quickStart: QuickStartUserSettings;
  recentSearches: string[];
  savedSearches: {
    [key: string]: { description: string; isFavorited: boolean; query: string };
  };
  ssh: SSHUserSettings;
};

type NavigationUserSettings = {
  autoHideNav?: boolean;
};

type SSHUserSettings = {
  [namespace: string]: string;
};

type ColumnsUserSettings = {
  [tableName: string]: string[];
};

type ColumnWidthsUserSettings = {
  [tableId: string]: Record<string, number>;
};

export type QuickStartUserSettings = {
  dontShowWelcomeModal?: boolean;
  tourStepsSeen?: number[];
};

type CardsUserSettings = {
  [cardPage: string]: Record<string, unknown>;
};

type DefaultVMLabelsUserSettings = {
  [labelKey: string]: string;
};
