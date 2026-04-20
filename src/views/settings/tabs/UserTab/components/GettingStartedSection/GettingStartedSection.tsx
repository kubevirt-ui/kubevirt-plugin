import React, { FCC } from 'react';

import useTour from '@kubevirt-utils/components/GuidedTour/hooks/useTour';
import { runningTourSignal } from '@kubevirt-utils/components/GuidedTour/utils/guidedTourSignals';
import HelpTextIcon from '@kubevirt-utils/components/HelpTextIcon/HelpTextIcon';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useKubevirtUserSettings from '@kubevirt-utils/hooks/useKubevirtUserSettings/useKubevirtUserSettings';
import PopoverContentWithLightspeedButton from '@lightspeed/components/PopoverContentWithLightspeedButton/PopoverContentWithLightspeedButton';
import { OLSPromptType } from '@lightspeed/utils/prompts';
import { Split, SplitItem, Stack, Switch } from '@patternfly/react-core';
import { useSignals } from '@preact/signals-react/runtime';
import ExpandSection from '@settings/ExpandSection/ExpandSection';
import { USER_TAB_IDS } from '@settings/search/constants';

import './GettingStartedSection.scss';

const GettingStartedSection: FCC = () => {
  useSignals();
  const { t } = useKubevirtTranslation();
  const [quickStarts, setQuickStarts] = useKubevirtUserSettings('quickStart');
  const run = runningTourSignal.value;
  const { startTour, stopTour } = useTour();

  return (
    <ExpandSection
      dataTestID="settings-user-getting-started"
      searchItemId={USER_TAB_IDS.gettingStarted}
      toggleText={t('Getting started resources')}
    >
      <Stack hasGutter>
        <Switch
          onChange={(_event, value) =>
            setQuickStarts({ ...quickStarts, dontShowWelcomeModal: !value })
          }
          className="GettingStartedSection__switch-text"
          data-test-id="welcome-information"
          isChecked={!quickStarts?.dontShowWelcomeModal}
          label={t('Welcome information')}
        />
        <Split>
          <SplitItem>
            <Switch
              className="GettingStartedSection__switch-text"
              data-test-id="guided-tour"
              isChecked={run}
              label={t('Guided tour')}
              onChange={run ? stopTour : startTour}
            />
          </SplitItem>
          <SplitItem className="pf-v6-u-pl-sm">
            <HelpTextIcon
              bodyContent={(hide) => (
                <PopoverContentWithLightspeedButton
                  content={t('Start the step-by-step guidance while using the app')}
                  hide={hide}
                  promptType={OLSPromptType.GUIDED_TOUR}
                />
              )}
            />
          </SplitItem>
        </Split>
      </Stack>
    </ExpandSection>
  );
};

export default GettingStartedSection;
