import { type FC } from 'react';

import SectionWithSwitch from '@kubevirt-utils/components/SectionWithSwitch/SectionWithSwitch';
import { LOAD_BALANCER_ENABLED } from '@kubevirt-utils/hooks/useFeatures/constants';
import useFeaturesConfigMap from '@kubevirt-utils/hooks/useFeatures/useFeaturesConfigMap';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { useMetalLBOperatorInstalled } from '@kubevirt-utils/hooks/useMetalLBOperatorInstalled/useMetalLBOperatorInstalled';
import { OLSPromptType } from '@lightspeed/utils/prompts';
import { useSettingsCluster } from '@settings/context/SettingsClusterContext';

import useUpdateSSHConfiguration from '../hooks/useUpdateSSHConfiguration';

type SSHOverLoadBalancerServiceProps = { newBadge: boolean };

const SSHOverLoadBalancerService: FC<SSHOverLoadBalancerServiceProps> = ({ newBadge }) => {
  const { t } = useKubevirtTranslation();
  const cluster = useSettingsCluster();
  const { isLoading, updateSSHConfiguration } = useUpdateSSHConfiguration(LOAD_BALANCER_ENABLED);

  const {
    featuresConfigMapData: [featureConfigMap, loaded],
    isAdmin,
  } = useFeaturesConfigMap(cluster);
  const hasMetalLBInstalled = useMetalLBOperatorInstalled(cluster);

  return (
    <SectionWithSwitch
      dataTestID="load-balancer"
      helpTextIconContent={t(
        'Enable the creation of LoadBalancer services for SSH connections to VirtualMachines. A load balancer must be configured',
      )}
      id="load-balancer-feature"
      isDisabled={!loaded || !isAdmin || hasMetalLBInstalled}
      isLoading={isLoading}
      newBadge={newBadge}
      olsPromptType={OLSPromptType.SSH_OVER_LOADBALANCER_SERVICE}
      switchIsOn={featureConfigMap?.data?.[LOAD_BALANCER_ENABLED] === 'true' || hasMetalLBInstalled}
      title={t('SSH over LoadBalancer service')}
      turnOnSwitch={(checked) => updateSSHConfiguration(checked.toString())}
    />
  );
};

export default SSHOverLoadBalancerService;
