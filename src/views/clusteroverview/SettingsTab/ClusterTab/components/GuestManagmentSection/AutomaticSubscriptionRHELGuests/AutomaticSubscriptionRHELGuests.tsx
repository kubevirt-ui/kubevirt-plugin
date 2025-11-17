import React, { FC, useEffect, useMemo, useState } from 'react';

import NewBadge from '@kubevirt-utils/components/badges/NewBadge/NewBadge';
import MutedTextSpan from '@kubevirt-utils/components/MutedTextSpan/MutedTextSpan';
import SectionWithSwitch from '@kubevirt-utils/components/SectionWithSwitch/SectionWithSwitch';
import { useFeatures } from '@kubevirt-utils/hooks/useFeatures/useFeatures';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useRHELAutomaticSubscription from '@kubevirt-utils/hooks/useRHELAutomaticSubscription/useRHELAutomaticSubscription';
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

  const type = useMemo(
    () => formProps?.subscriptionData?.type,
    [formProps?.subscriptionData?.type],
  );

  const [selected, setSelected] = useState<{ title: string; value: string }>(
    getSubscriptionItem(type),
  );

  const isDisabled = !type || type === AutomaticSubscriptionTypeEnum.NO_SUBSCRIPTION;

  useEffect(() => {
    if (!selected) {
      setSelected(getSubscriptionItem(type));
    }
  }, [type, selected]);

  const isInitialLoad = loading && featureEnabled === null;

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
        <Title headingLevel="h5">{t('Subscription type')}</Title>
        <AutomaticSubscriptionType
          selected={selected}
          setSelected={setSelected}
          updateSubscriptionType={formProps.updateSubscription}
        />
        {!isDisabled && (
          <>
            <AutomaticSubscriptionForm {...formProps} />
            {selected?.value !== AutomaticSubscriptionTypeEnum.NO_SUBSCRIPTION && (
              <>
                <SectionWithSwitch
                  helpTextIconContent={t(
                    'Automatically pull updates from the RHEL repository. Activation key and Organization ID are mandatory to enable this.',
                  )}
                  turnOnSwitch={(val) => {
                    if (!loading) {
                      toggleFeature(val);
                    }
                  }}
                  dataTestID={AUTOMATIC_UPDATE_FEATURE_NAME}
                  id={AUTOMATIC_UPDATE_FEATURE_NAME}
                  isDisabled={isInitialLoad}
                  isLoading={loading}
                  switchIsOn={featureEnabled}
                  title={t('Enable auto updates for RHEL VirtualMachines')}
                />
                {selected?.value ===
                  AutomaticSubscriptionTypeEnum.MONITOR_AND_MANAGE_SUBSCRIPTIONS && (
                  <AutomaticSubscriptionCustomUrl
                    customUrl={formProps.subscriptionData?.customUrl}
                  />
                )}
              </>
            )}
          </>
        )}
      </Stack>
    </ExpandSection>
  );
};

export default AutomaticSubscriptionRHELGuests;
