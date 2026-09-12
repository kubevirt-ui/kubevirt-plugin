import React, { type FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { HealthState, type K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';
import { HealthItem } from '@openshift-console/dynamic-plugin-sdk-internal';

import { AVAILABLE } from './constants';

type NetworkAddonsConfigCondition = {
  message?: string;
  status?: string;
  type?: string;
};

type NetworkAddonsConfig = K8sResourceCommon & {
  status?: {
    conditions?: NetworkAddonsConfigCondition[];
  };
};

type NetworkingHealthItemProps = {
  nac: NetworkAddonsConfig;
};

const NetworkingHealthItem: FC<NetworkingHealthItemProps> = ({ nac }) => {
  const { t } = useKubevirtTranslation();
  const nacConditions = nac?.status?.conditions;
  const availableCondition = nacConditions?.find((condition) => condition?.type === AVAILABLE);
  const status = availableCondition?.status === 'True';
  const message = availableCondition?.message;
  const state = status ? HealthState.OK : HealthState.NOT_AVAILABLE;

  return <HealthItem details={message} state={state} title={t('Networking')} />;
};

export default NetworkingHealthItem;
