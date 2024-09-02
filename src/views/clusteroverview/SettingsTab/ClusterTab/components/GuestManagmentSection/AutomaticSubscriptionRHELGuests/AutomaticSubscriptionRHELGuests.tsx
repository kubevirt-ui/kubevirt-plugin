import React, { FC, useEffect, useState } from 'react';

import NewBadge from '@kubevirt-utils/components/badges/NewBadge/NewBadge';
import MutedTextSpan from '@kubevirt-utils/components/MutedTextSpan/MutedTextSpan';
import SectionWithSwitch from '@kubevirt-utils/components/SectionWithSwitch/SectionWithSwitch';
import { useFeatures } from '@kubevirt-utils/hooks/useFeatures/useFeatures';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useRHELAutomaticSubscription from '@kubevirt-utils/hooks/useRHELAutomaticSubscription/useRHELAutomaticSubscription';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { Stack, Title } from '@patternfly/react-core';

import ExpandSection from '../../../../ExpandSection/ExpandSection';

import AutomaticSubscriptionCustomUrl from './components/AutomaticSubscriptionCustomUrl/AutomaticSubscriptionCustomUrl';
import AutomaticSubscriptionForm from './components/AutomaticSubscriptionForm/AutomaticSubscriptionForm';
import AutomaticSubscriptionType from './components/AutomaticSubscriptionType/AutomaticSubscriptionType';
import {
  AutomaticSubscriptionTypeEnum,
  getSubscriptionItem,
} from './components/AutomaticSubscriptionType/utils/utils';
import { AUTOMATIC_UPDATE_FEATURE_NAME } from './utils/constants';

type AutomaticSubscriptionRHELGuestsProps = {
  newBadge?: boolean;
};

const AutomaticSubscriptionRHELGuests: FC<AutomaticSubscriptionRHELGuestsProps> = ({
  newBadge = false,
}) => {
  const { t } = useKubevirtTranslation();
  const { featureEnabled, loading, toggleFeature } = useFeatures(AUTOMATIC_UPDATE_FEATURE_NAME);
  const formProps = useRHELAutomaticSubscription();
  const [selected, setSelected] = useState<{ title: string; value: string }>(
    getSubscriptionItem(formProps?.subscriptionData?.type),
  );

  const isDisabled =
    isEmpty(formProps?.subscriptionData?.activationKey) ||
    isEmpty(formProps?.subscriptionData?.organizationID);

  useEffect(() => {
    if (isDisabled) toggleFeature(false);
  }, [isDisabled, toggleFeature]);

  useEffect(() => {
    if (!selected) {
      setSelected(getSubscriptionItem(formProps?.subscriptionData?.type));
    }
  }, [formProps?.subscriptionData?.type, selected]);

  if (loading) return null;

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
        {!isDisabled && (
          <>
            <Title headingLevel="h5">{t('Subscription type')}</Title>
            <AutomaticSubscriptionType
              selected={selected}
              setSelected={setSelected}
              updateSubscriptionType={formProps.updateSubscription}
            />
            {selected?.value !== AutomaticSubscriptionTypeEnum.NO_SUBSCRIPTION && (
              <>
                <SectionWithSwitch
                  helpTextIconContent={t(
                    'Automatically pull updates from the RHEL repository. Activation key and Organization ID are mandatory to enable this.',
                  )}
                  turnOnSwitch={(val) => {
                    toggleFeature(val);
                  }}
                  id={AUTOMATIC_UPDATE_FEATURE_NAME}
                  switchIsOn={featureEnabled}
                  title={t('Enable auto updates for RHEL VirtualMachines')}
                />
                <AutomaticSubscriptionCustomUrl
                  isDisabled={
                    selected?.value === AutomaticSubscriptionTypeEnum.ENABLE_PREDICTIVE_ANALYTICS
                  }
                  customUrl={formProps.subscriptionData?.customUrl}
                  updateCustomUrl={formProps.updateSubscription}
                />
              </>
            )}
          </>
        )}
      </Stack>
    </ExpandSection>
  );
};

export default AutomaticSubscriptionRHELGuests;
