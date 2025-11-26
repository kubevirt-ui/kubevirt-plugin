import React, { FC, useCallback, useState } from 'react';
import { useDebounceCallback } from 'src/views/clusteroverview/utils/hooks/useDebounceCallback';

import { ConfigMapModel } from '@kubevirt-ui/kubevirt-api/console';
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
import LightspeedSimplePopoverContent from '@lightspeed/components/LightspeedSimplePopoverContent';
import { OLSPromptType } from '@lightspeed/utils/prompts';
import { k8sPatch } from '@openshift-console/dynamic-plugin-sdk';
import { CLUSTER_TAB_IDS } from '@overview/SettingsTab/search/constants';
import { Stack, TextInput } from '@patternfly/react-core';

import ExpandSection from '../../../../ExpandSection/ExpandSection';

type SSHConfigurationProps = { newBadge: boolean };

const SSHConfiguration: FC<SSHConfigurationProps> = ({ newBadge }) => {
  const { t } = useKubevirtTranslation();
  const [url, setUrl] = useState<string>(null);
  const {
    featuresConfigMapData: [featureConfigMap, loaded],
    isAdmin,
  } = useFeaturesConfigMap();
  const hasMetalLBInstalled = useMetalLBOperatorInstalled();

  const [loadBalancerIsLoading, setLoadBalancerIsLoading] = useState<boolean>(false);
  const [nodePortIsLoading, setNodePortIsLoading] = useState<boolean>(false);

  const onChange = useCallback(
    (val: string, field: string) => {
      const setIsLoading =
        field === LOAD_BALANCER_ENABLED ? setLoadBalancerIsLoading : setNodePortIsLoading;
      setIsLoading(true);
      k8sPatch({
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
    [featureConfigMap],
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
          helpTextIconContent={(hide) => (
            <LightspeedSimplePopoverContent
              content={t(
                'Enable the creation of LoadBalancer services for SSH connections to VirtualMachines. A load balancer must be configured',
              )}
              hide={hide}
              promptType={OLSPromptType.SSH_OVER_LOADBALANCER_SERVICE}
            />
          )}
          switchIsOn={
            featureConfigMap?.data?.[LOAD_BALANCER_ENABLED] === 'true' || hasMetalLBInstalled
          }
          dataTestID="load-balancer"
          id="load-balancer-feature"
          isDisabled={!loaded || !isAdmin || hasMetalLBInstalled}
          isLoading={loadBalancerIsLoading}
          newBadge={newBadge}
          title={t('SSH over LoadBalancer service')}
          turnOnSwitch={(checked) => onChange(checked.toString(), LOAD_BALANCER_ENABLED)}
        />
        <SectionWithSwitch
          helpTextIconContent={(hide) => (
            <LightspeedSimplePopoverContent
              content={t(
                'Allow the creation of NodePort services for SSH connections to VirtualMachines. An address of a publicly available Node must be provided.',
              )}
              hide={hide}
              promptType={OLSPromptType.SSH_OVER_NODEPORT_SERVICE}
            />
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
