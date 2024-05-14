import React, { FC } from 'react';

import { IoK8sApiCoreV1Service } from '@kubevirt-ui/kubevirt-api/kubernetes';
import FormPFSelect from '@kubevirt-utils/components/FormPFSelect/FormPFSelect';
import {
  LOAD_BALANCER_ENABLED,
  NODE_PORT_ENABLED,
} from '@kubevirt-utils/hooks/useFeatures/constants';
import { useFeatures } from '@kubevirt-utils/hooks/useFeatures/useFeatures';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { useMetalLBOperatorInstalled } from '@kubevirt-utils/hooks/useMetalLBOperatorInstalled/useMetalLBOperatorInstalled';
import { SelectList, SelectOption } from '@patternfly/react-core';

import { SERVICE_TYPES, serviceTypeTitles } from '../constants';

type SSHServiceSelectProps = {
  onSSHChange: (serviceType: SERVICE_TYPES) => void;
  sshService: IoK8sApiCoreV1Service;
  sshServiceLoaded: boolean;
};

const SSHServiceSelect: FC<SSHServiceSelectProps> = ({
  onSSHChange,
  sshService,
  sshServiceLoaded,
}) => {
  const { t } = useKubevirtTranslation();
  const hasMetalLBInstalled = useMetalLBOperatorInstalled();

  const { featureEnabled: loadBalancerConfigFlag } = useFeatures(LOAD_BALANCER_ENABLED);
  const { featureEnabled: nodePortEnabled } = useFeatures(NODE_PORT_ENABLED);

  const loadBalancerEnabled = loadBalancerConfigFlag || hasMetalLBInstalled;

  const sshServiceType = sshService?.spec?.type ?? SERVICE_TYPES.NONE;

  const handleChange = (_, newValue: string | undefined) => {
    if (newValue === sshServiceType) return;
    onSSHChange(newValue as SERVICE_TYPES);
  };

  return (
    <FormPFSelect
      onSelect={handleChange}
      selected={sshServiceType}
      selectedLabel={serviceTypeTitles[sshServiceType]}
      toggleProps={{ isDisabled: !sshServiceLoaded, isFullWidth: true }}
    >
      <SelectList>
        <SelectOption id={SERVICE_TYPES.NONE} value={SERVICE_TYPES.NONE}>
          {serviceTypeTitles.None}
        </SelectOption>
        <SelectOption
          description={t(
            'Assigns an external IP address to the VirtualMachine. This option requires a LoadBalancer Service backend',
          )}
          id={SERVICE_TYPES.LOAD_BALANCER}
          isDisabled={!loadBalancerEnabled}
          value={SERVICE_TYPES.LOAD_BALANCER}
        >
          {serviceTypeTitles.LoadBalancer}
        </SelectOption>
        <SelectOption
          description={t(
            'Opens a specific port on all Nodes in the cluster. If the Node is publicly accessible, any traffic sent to this port is forwarded to the Service.',
          )}
          id={SERVICE_TYPES.NODE_PORT}
          isAriaDisabled={!nodePortEnabled}
          value={SERVICE_TYPES.NODE_PORT}
          {...(!nodePortEnabled && {
            tooltipProps: {
              content: t(
                'NodePort service is disabled. Ask your cluster admin to enable it in cluster settings.',
              ),
            },
          })}
        >
          {serviceTypeTitles.NodePort}
        </SelectOption>
      </SelectList>
    </FormPFSelect>
  );
};

export default SSHServiceSelect;
