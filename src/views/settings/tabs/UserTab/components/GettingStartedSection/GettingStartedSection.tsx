import React, { FC } from 'react';

import useTour from '@kubevirt-utils/components/GuidedTour/hooks/useTour';
import { runningTourSignal } from '@kubevirt-utils/components/GuidedTour/utils/guidedTourSignals';
import SearchItem from '@kubevirt-utils/components/SearchItem/SearchItem';
import SectionWithSwitch from '@kubevirt-utils/components/SectionWithSwitch/SectionWithSwitch';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useKubevirtUserSettings from '@kubevirt-utils/hooks/useKubevirtUserSettings/useKubevirtUserSettings';
import { USER_SETTINGS_KEYS } from '@kubevirt-utils/hooks/useKubevirtUserSettings/utils/const';
import { OLSPromptType } from '@lightspeed/utils/prompts';
import { Stack } from '@patternfly/react-core';
import { useSignals } from '@preact/signals-react/runtime';
import ExpandSection from '@settings/ExpandSection/ExpandSection';
import { USER_TAB_IDS } from '@settings/search/constants';

const GettingStartedSection: FC = () => {
  useSignals();
  const { t } = useKubevirtTranslation();
  const [quickStarts, setQuickStarts] = useKubevirtUserSettings(USER_SETTINGS_KEYS.quickStart);
  const run = runningTourSignal.value;
  const { startTour, stopTour } = useTour();

  return (
    <ExpandSection
      dataTestID="settings-user-getting-started"
      searchItemId={USER_TAB_IDS.gettingStarted}
      toggleText={t('Getting started resources')}
    >
      <Stack hasGutter>
        <SectionWithSwitch
          title={
            <SearchItem id={USER_TAB_IDS.welcomeInformation}>{t('Welcome information')}</SearchItem>
          }
          turnOnSwitch={(checked) =>
            setQuickStarts({ ...quickStarts, dontShowWelcomeModal: !checked })
          }
          dataTestID="welcome-information"
          switchIsOn={!quickStarts?.dontShowWelcomeModal}
        />
        <SectionWithSwitch
          dataTestID="guided-tour"
          helpTextIconContent={t('Start the step-by-step guidance while using the app')}
          olsPromptType={OLSPromptType.GUIDED_TOUR}
          switchIsOn={run}
          title={<SearchItem id={USER_TAB_IDS.guidedTour}>{t('Guided tour')}</SearchItem>}
          turnOnSwitch={(checked) => (checked ? startTour() : stopTour())}
        />
      </Stack>
    </ExpandSection>
  );
};

export default GettingStartedSection;
