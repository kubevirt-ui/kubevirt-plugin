import React, { FC } from 'react';

import MutedTextSpan from '@kubevirt-utils/components/MutedTextSpan/MutedTextSpan';
import NewBadge from '@kubevirt-utils/components/NewBadge/NewBadge';
import SectionWithSwitch from '@kubevirt-utils/components/SectionWithSwitch/SectionWithSwitch';
import { useFeatures } from '@kubevirt-utils/hooks/useFeatures/useFeatures';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Stack } from '@patternfly/react-core';

import ExpandSection from '../../../../ExpandSection/ExpandSection';

import AutomaticSubscriptionForm from './components/AutomaticSubscriptionForm/AutomaticSubscriptionForm';
import { AUTOMATIC_UPDATE_FEATURE_NAME } from './utils/constants';

type AutomaticSubscriptionRHELGuestsProps = {
  newBadge?: boolean;
};

const AutomaticSubscriptionRHELGuests: FC<AutomaticSubscriptionRHELGuestsProps> = ({
  newBadge = false,
}) => {
  const { t } = useKubevirtTranslation();
  const { featureEnabled, toggleFeature } = useFeatures(AUTOMATIC_UPDATE_FEATURE_NAME);

  return (
    <ExpandSection
      toggleContent={
        <>
          {t('Automatic subscription of new RHEL VirtualMachines')}
          {newBadge && <NewBadge />}
        </>
      }
    >
      <Stack hasGutter>
        <MutedTextSpan
          text={t('Enable automatic subscription for Red Hat Enterprise Linux VirtualMachines.\n')}
        />
        <MutedTextSpan
          text={t('Cluster administrator permissions are required to enable this feature.')}
        />
        <AutomaticSubscriptionForm />
        <SectionWithSwitch
          helpTextIconContent={t('Automatically pull updates from the RHEL repository')}
          id={AUTOMATIC_UPDATE_FEATURE_NAME}
          switchIsOn={featureEnabled}
          title={t('Enable auto updates for RHEL VirtualMachines')}
          turnOnSwitch={toggleFeature}
        />
      </Stack>
    </ExpandSection>
  );
};

export default AutomaticSubscriptionRHELGuests;
