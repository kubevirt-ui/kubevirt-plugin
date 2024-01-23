import React, { FC, useEffect } from 'react';

import MutedTextSpan from '@kubevirt-utils/components/MutedTextSpan/MutedTextSpan';
import NewBadge from '@kubevirt-utils/components/NewBadge/NewBadge';
import SectionWithSwitch from '@kubevirt-utils/components/SectionWithSwitch/SectionWithSwitch';
import { useFeatures } from '@kubevirt-utils/hooks/useFeatures/useFeatures';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useRHELAutomaticSubscription from '@kubevirt-utils/hooks/useRHELAutomaticSubscription/useRHELAutomaticSubscription';
import { isEmpty } from '@kubevirt-utils/utils/utils';
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
  const formProps = useRHELAutomaticSubscription();

  const isDisabled =
    isEmpty(formProps?.subscriptionData?.activationKey) ||
    isEmpty(formProps?.subscriptionData?.organizationID);

  useEffect(() => {
    if (isDisabled) toggleFeature(false);
  }, [isDisabled, toggleFeature]);

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
        <AutomaticSubscriptionForm {...formProps} />
        <SectionWithSwitch
          helpTextIconContent={t(
            'Automatically pull updates from the RHEL repository. Activation key and Organization ID are mandatory to enable this.',
          )}
          id={AUTOMATIC_UPDATE_FEATURE_NAME}
          isDisabled={isDisabled}
          switchIsOn={featureEnabled}
          title={t('Enable auto updates for RHEL VirtualMachines')}
          turnOnSwitch={toggleFeature}
        />
      </Stack>
    </ExpandSection>
  );
};

export default AutomaticSubscriptionRHELGuests;
