import { OnboardingPopoversHidden } from '@kubevirt-utils/components/OnboardingPopover/types';

export type UserSettingsState = {
  cards: CardsUserSettings;
  columns: ColumnsUserSettings;
  favoriteBootableVolumes: string[];
  navigation: NavigationUserSettings;
  onboardingPopoversHidden: OnboardingPopoversHidden;
  quickStart: QuickStartUserSettings;
  recentSearches: string[];
  savedSearches: {
    [key: string]: any;
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

type QuickStartUserSettings = {
  dontShowWelcomeModal?: boolean;
  tourStepsSeen?: number[];
};

type CardsUserSettings = {
  [cardPage: string]: { cardName: string; value: boolean };
};
