import * as React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { HealthState } from '@openshift-console/dynamic-plugin-sdk';
import { HealthItem } from '@openshift-console/dynamic-plugin-sdk-internal';

import { AVAILABLE } from './constants';

const NetworkingHealthItem = ({ nac }) => {
  const { t } = useKubevirtTranslation();
  const nacConditions = nac?.status?.conditions;
  const availableCondition = nacConditions?.find((condition) => condition?.type === AVAILABLE);
  const status = availableCondition?.status === 'True';
  const message = availableCondition?.message;
  const state = status ? HealthState.OK : HealthState.NOT_AVAILABLE;

  return <HealthItem title={t('Networking')} state={state} details={message} />;
};

export default NetworkingHealthItem;
