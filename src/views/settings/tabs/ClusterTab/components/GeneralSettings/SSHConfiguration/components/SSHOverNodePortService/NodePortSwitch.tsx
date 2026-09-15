import { type FC } from 'react';
import isEmpty from 'lodash/isEmpty';

import { NODE_PORT_ADDRESS, NODE_PORT_ENABLED } from '@kubevirt-utils/hooks/useFeatures/constants';
import useFeaturesConfigMap from '@kubevirt-utils/hooks/useFeatures/useFeaturesConfigMap';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Switch } from '@patternfly/react-core';
import { useSettingsCluster } from '@settings/context/SettingsClusterContext';

import useUpdateSSHConfiguration from '../../hooks/useUpdateSSHConfiguration';

export const NodePortSwitch: FC = () => {
  const { t } = useKubevirtTranslation();
  const cluster = useSettingsCluster();
  const { isLoading, updateSSHConfiguration } = useUpdateSSHConfiguration(NODE_PORT_ENABLED);

  const {
    featuresConfigMapData: [featureConfigMap, loaded],
    isAdmin,
  } = useFeaturesConfigMap(cluster);

  const isChecked =
    featureConfigMap?.data?.[NODE_PORT_ENABLED] === 'true' &&
    !isEmpty(featureConfigMap?.data?.[NODE_PORT_ADDRESS]);

  return (
    <Switch
      aria-label={
        isChecked ? t('Disable SSH over NodePort service') : t('Enable SSH over NodePort service')
      }
      className={isLoading ? 'kv-cursor--loading' : undefined}
      data-test="node-port"
      isChecked={isChecked}
      isDisabled={!loaded || !isAdmin || isEmpty(featureConfigMap?.data?.[NODE_PORT_ADDRESS])}
      onChange={(_event, checked) => updateSSHConfiguration(checked.toString())}
    />
  );
};
