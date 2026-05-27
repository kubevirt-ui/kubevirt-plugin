import React, { FC } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import FormPFSelect from '@kubevirt-utils/components/FormPFSelect/FormPFSelect';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { Alert, AlertVariant, SelectOption, Skeleton } from '@patternfly/react-core';

import useSelectableVMNetworksWithNamespaces from '../hooks/useSelectableVMNetworksWithNamespaces';
import { VMNetworkWithNamespaces } from '../types';

export type VMNetworkSelectProps = {
  currentNetwork: string;
  onSelect: (newSelection: VMNetworkWithNamespaces) => void;
  selectedNetwork: string;
  vms: V1VirtualMachine[];
};

const VMNetworkSelect: FC<VMNetworkSelectProps> = ({
  currentNetwork,
  onSelect,
  selectedNetwork,
  vms,
}) => {
  const { t } = useKubevirtTranslation();
  const [vmNetworksWithNamespaces, loaded, error] = useSelectableVMNetworksWithNamespaces(
    currentNetwork,
    vms,
  );

  if (!loaded) return <Skeleton />;

  if (error)
    return (
      <Alert title={t('Error')} variant={AlertVariant.danger}>
        {error.message ?? t('Error loading networks')}
      </Alert>
    );

  return (
    <FormPFSelect
      id="vm-network-select"
      placeholder={t('Select a virtual machine network')}
      selected={selectedNetwork}
      toggleProps={{ isFullWidth: true }}
    >
      {isEmpty(vmNetworksWithNamespaces) ? (
        <SelectOption isDisabled key="no-networks" value="no-networks">
          {t('No other networks available')}
        </SelectOption>
      ) : (
        vmNetworksWithNamespaces.map(({ namespaceNames, vmNetworkName }) => (
          <SelectOption
            key={vmNetworkName}
            onClick={() => onSelect({ namespaceNames, vmNetworkName })}
            value={vmNetworkName}
          >
            {vmNetworkName}
          </SelectOption>
        ))
      )}
    </FormPFSelect>
  );
};

export default VMNetworkSelect;
