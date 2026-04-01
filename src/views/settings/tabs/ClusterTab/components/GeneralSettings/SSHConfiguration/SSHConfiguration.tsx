import React, { FC, useCallback, useEffect, useState } from 'react';
import { useDebounceCallback } from 'src/views/clusteroverview/utils/hooks/useDebounceCallback';

import { ConfigMapModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import SectionWithSwitch from '@kubevirt-utils/components/SectionWithSwitch/SectionWithSwitch';
import {
  LOAD_BALANCER_ENABLED,
  NODE_PORT_ADDRESS,
  NODE_PORT_ENABLED,
} from '@kubevirt-utils/hooks/useFeatures/constants';
import useFeaturesConfigMap from '@kubevirt-utils/hooks/useFeatures/useFeaturesConfigMap';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { useMetalLBOperatorInstalled } from '@kubevirt-utils/hooks/useMetalLBOperatorInstalled/useMetalLBOperatorInstalled';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { OLSPromptType } from '@lightspeed/utils/prompts';
import { kubevirtK8sPatch } from '@multicluster/k8sRequests';
import { Stack, TextInput } from '@patternfly/react-core';
import { useSettingsCluster } from '@settings/context/SettingsClusterContext';
import ExpandSection from '@settings/ExpandSection/ExpandSection';
import { CLUSTER_TAB_IDS } from '@settings/search/constants';

type SSHConfigurationProps = { newBadge: boolean };

const SSHConfiguration: FC<SSHConfigurationProps> = ({ newBadge }) => {
  const { t } = useKubevirtTranslation();
  const cluster = useSettingsCluster();
  const [url, setUrl] = useState<string>(null);

  useEffect(() => {
    setUrl(null);
  }, [cluster]);

  const {
    featuresConfigMapData: [featureConfigMap, loaded],
    isAdmin,
  } = useFeaturesConfigMap(cluster);
  const hasMetalLBInstalled = useMetalLBOperatorInstalled(cluster);

  const [loadBalancerIsLoading, setLoadBalancerIsLoading] = useState<boolean>(false);
  const [nodePortIsLoading, setNodePortIsLoading] = useState<boolean>(false);

  const onChange = useCallback(
    (val: string, field: string) => {
      const setIsLoading =
        field === LOAD_BALANCER_ENABLED ? setLoadBalancerIsLoading : setNodePortIsLoading;
      setIsLoading(true);
      kubevirtK8sPatch({
        cluster,
        data: [
          {
            op: 'replace',
            path: `/data/${field}`,
            value: val,
          },
        ],
        model: ConfigMapModel,
        resource: featureConfigMap,
      }).finally(() => setIsLoading(false));
    },
    [cluster, featureConfigMap],
  );

  const onTextChange = useDebounceCallback((val: string, field) => {
    onChange(val, field);
  }, 700);

  return (
    <ExpandSection
      searchItemId={CLUSTER_TAB_IDS.sshConfiguration}
      toggleText={t('SSH configurations')}
    >
      <Stack hasGutter>
        <SectionWithSwitch
          helpTextIconContent={t(
            'Enable the creation of LoadBalancer services for SSH connections to VirtualMachines. A load balancer must be configured',
          )}
          switchIsOn={
            featureConfigMap?.data?.[LOAD_BALANCER_ENABLED] === 'true' || hasMetalLBInstalled
          }
          dataTestID="load-balancer"
          id="load-balancer-feature"
          isDisabled={!loaded || !isAdmin || hasMetalLBInstalled}
          isLoading={loadBalancerIsLoading}
          newBadge={newBadge}
          olsPromptType={OLSPromptType.SSH_OVER_LOADBALANCER_SERVICE}
          title={t('SSH over LoadBalancer service')}
          turnOnSwitch={(checked) => onChange(checked.toString(), LOAD_BALANCER_ENABLED)}
        />
        <SectionWithSwitch
          helpTextIconContent={t(
            'Allow the creation of NodePort services for SSH connections to VirtualMachines. An address of a publicly available Node must be provided.',
          )}
          switchIsOn={
            featureConfigMap?.data?.[NODE_PORT_ENABLED] === 'true' &&
            !isEmpty(featureConfigMap?.data?.[NODE_PORT_ADDRESS])
          }
          dataTestID="node-port"
          id="node-port-feature"
          isDisabled={!loaded || !isAdmin || isEmpty(featureConfigMap?.data?.[NODE_PORT_ADDRESS])}
          isLoading={nodePortIsLoading}
          newBadge={newBadge}
          olsPromptType={OLSPromptType.SSH_OVER_NODEPORT_SERVICE}
          title={t('SSH over NodePort service')}
          turnOnSwitch={(checked) => onChange(checked.toString(), NODE_PORT_ENABLED)}
        />
        <TextInput
          onChange={(_event, value: string) => {
            setUrl(value);
            onTextChange(value, NODE_PORT_ADDRESS);
          }}
          className="pf-v6-u-mr-md"
          id="node-address"
          isRequired
          name="node-address"
          placeholder={t('Enter node address')}
          value={url ?? featureConfigMap?.data?.[NODE_PORT_ADDRESS]}
        />
      </Stack>
    </ExpandSection>
  );
};

export default SSHConfiguration;
