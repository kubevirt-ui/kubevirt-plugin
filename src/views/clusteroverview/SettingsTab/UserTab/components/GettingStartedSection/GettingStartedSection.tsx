import React, { FC } from 'react';

import {
  runningTourSignal,
  startTour,
} from '@kubevirt-utils/components/GuidedTour/utils/constants';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useKubevirtUserSettings from '@kubevirt-utils/hooks/useKubevirtUserSettings/useKubevirtUserSettings';
import { Stack, Switch } from '@patternfly/react-core';

import ExpandSection from '../../../ExpandSection/ExpandSection';

import './GettingStartedSection.scss';

const GettingStartedSection: FC = () => {
  const { t } = useKubevirtTranslation();
  const [quickStarts, setQuickStarts] = useKubevirtUserSettings('quickStart');
  const run = runningTourSignal.value;
  return (
    <ExpandSection toggleText={t('Getting started resources')}>
      <Stack hasGutter>
        <Switch
          onChange={(_event, value) =>
            setQuickStarts({ ...quickStarts, dontShowWelcomeModal: !value })
          }
          className="GettingStartedSection__switch-text"
          isChecked={!quickStarts?.dontShowWelcomeModal}
          label={t('Welcome information')}
        />
        <Switch
          className="GettingStartedSection__switch-text"
          isChecked={run}
          label={t('Guided tour')}
          onChange={!run && startTour}
        />
      </Stack>
    </ExpandSection>
  );
};

export default GettingStartedSection;
