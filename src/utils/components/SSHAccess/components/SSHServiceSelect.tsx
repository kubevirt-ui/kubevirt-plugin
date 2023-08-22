import React, { FC, useMemo } from 'react';

import { IoK8sApiCoreV1Service } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { LOAD_BALANCER_ENABLED } from '@kubevirt-utils/hooks/useFeatures/constants';
import { useFeatures } from '@kubevirt-utils/hooks/useFeatures/useFeatures';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { useK8sModels } from '@openshift-console/dynamic-plugin-sdk';
import { Select, SelectOption, SelectVariant } from '@patternfly/react-core';

import { METALLB_GROUP, SERVICE_TYPES } from '../constants';

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
  const [isOpen, setIsOpen] = React.useState(false);
  const [models] = useK8sModels();

  const { featureEnabled: loadBalancerConfigFlag } = useFeatures(LOAD_BALANCER_ENABLED);

  const hasSomeMetalCrd = useMemo(
    () =>
      Object.keys(models).some((modelGroupVersionKind) =>
        modelGroupVersionKind.startsWith(METALLB_GROUP),
      ),
    [models],
  );

  const loadBalancerEnabled = loadBalancerConfigFlag || hasSomeMetalCrd;

  const sshServiceType = sshService?.spec?.type ?? SERVICE_TYPES.NONE;
  const handleChange = (event: React.ChangeEvent<Element>, newValue: string | undefined) => {
    setIsOpen(false);

    if (newValue === sshServiceType) return;
    onSSHChange(newValue as SERVICE_TYPES);
  };

  return (
    <Select
      isDisabled={!sshServiceLoaded}
      isOpen={isOpen}
      menuAppendTo="parent"
      onSelect={handleChange}
      onToggle={setIsOpen}
      selections={sshServiceType}
      toggleId="ssh-service-select"
      variant={SelectVariant.single}
    >
      <SelectOption id={SERVICE_TYPES.NONE} value={SERVICE_TYPES.NONE}>
        {t('None')}
      </SelectOption>
      <SelectOption
        description={t(
          'Assigns an external IP address to the VirtualMachine. This option requires a LoadBalancer Service backend',
        )}
        id={SERVICE_TYPES.LOAD_BALANCER}
        isDisabled={!loadBalancerEnabled}
        value={SERVICE_TYPES.LOAD_BALANCER}
      >
        {t('SSH over LoadBalancer')}
      </SelectOption>
    </Select>
  );
};

export default SSHServiceSelect;
