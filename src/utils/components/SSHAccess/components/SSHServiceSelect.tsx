import React, { FC, useMemo } from 'react';

import { IoK8sApiCoreV1Service } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { useK8sModels } from '@openshift-console/dynamic-plugin-sdk';
import { Select, SelectOption, SelectVariant } from '@patternfly/react-core';

import { METALLB_GROUP, SERVICE_TYPES } from '../constants';

type SSHServiceSelectProps = {
  sshService: IoK8sApiCoreV1Service;
  sshServiceLoaded: boolean;
  onSSHChange: (serviceType: SERVICE_TYPES) => void;
};

const SSHServiceSelect: FC<SSHServiceSelectProps> = ({
  sshService,
  sshServiceLoaded,
  onSSHChange,
}) => {
  const { t } = useKubevirtTranslation();
  const [isOpen, setIsOpen] = React.useState(false);
  const [models] = useK8sModels();

  const sshServiceType = sshService?.spec?.type ?? SERVICE_TYPES.NONE;

  const hasSomeMetalCrd = useMemo(
    () =>
      Object.keys(models).some((modelGroupVersionKind) =>
        modelGroupVersionKind.startsWith(METALLB_GROUP),
      ),
    [models],
  );

  const handleChange = (event: React.ChangeEvent<Element>, newValue: string | undefined) => {
    setIsOpen(false);

    if (newValue === sshServiceType) return;
    onSSHChange(newValue as SERVICE_TYPES);
  };

  return (
    <Select
      menuAppendTo="parent"
      isOpen={isOpen}
      onToggle={setIsOpen}
      onSelect={handleChange}
      variant={SelectVariant.single}
      selections={sshServiceType}
      isDisabled={!sshServiceLoaded}
      toggleId="ssh-service-select"
    >
      <SelectOption value={SERVICE_TYPES.NONE} id={SERVICE_TYPES.NONE}>
        {t('None')}
      </SelectOption>
      <SelectOption
        value={SERVICE_TYPES.NODE_PORT}
        id={SERVICE_TYPES.NODE_PORT}
        description={t(
          'Opens a specific port on all Nodes in the cluster. If the Node is publicly accessible, any traffic that is sent to this port is forwarded to the Service',
        )}
      >
        {t('SSH over NodePort')}
      </SelectOption>
      <SelectOption
        isDisabled={!hasSomeMetalCrd}
        value={SERVICE_TYPES.LOAD_BALANCER}
        id={SERVICE_TYPES.LOAD_BALANCER}
        description={t(
          'Assigns an external IP address to the VirtualMachine. This option requires a LoadBalancer Service backend',
        )}
      >
        {t('SSH over LoadBalancer')}
      </SelectOption>
    </Select>
  );
};

export default SSHServiceSelect;
