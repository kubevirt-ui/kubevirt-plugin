import { OnboardingPopoversHidden } from '@kubevirt-utils/components/OnboardingPopover/types';

export type UserSettingsState = {
  cards: CardsUserSettings;
  columns: ColumnsUserSettings;
  favoriteBootableVolumes: string[];
  onboardingPopoversHidden: OnboardingPopoversHidden;
  quickStart: QuickStartUserSettings;
  savedSearches: {
    [key: string]: any;
  };
  ssh: SSHUserSettings;
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
