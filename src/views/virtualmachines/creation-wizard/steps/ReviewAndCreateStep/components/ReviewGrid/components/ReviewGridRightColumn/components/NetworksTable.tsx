import React, { FC, memo } from 'react';

import { WizardDescriptionItem } from '@catalog/wizard/components/WizardDescriptionItem';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getInterfaces, getNetworks, NO_DATA_DASH } from '@kubevirt-utils/resources/vm';
import { getNetworkNameLabel } from '@kubevirt-utils/resources/vm/utils/network/network-columns';
import { getNetworkInterfaceRowData } from '@kubevirt-utils/resources/vm/utils/network/rowData';
import { getPrintableNetworkInterfaceType } from '@kubevirt-utils/resources/vm/utils/network/selectors';
import { DescriptionList, Stack, StackItem } from '@patternfly/react-core';
import { wizardVMSignal } from '@virtualmachines/creation-wizard/state/vm-signal/vmStore';

const NetworksTable: FC = memo(() => {
  const { t } = useKubevirtTranslation();
  const vm = wizardVMSignal.value;
  const networks = getNetworks(vm);
  const interfaces = getInterfaces(vm);
  const networkData = getNetworkInterfaceRowData(networks, interfaces);

  return (
    <DescriptionList columnModifier={{ default: '3Col' }}>
      <WizardDescriptionItem
        description={
          <Stack>
            {networkData.map((n, idx) => (
              <StackItem key={n.iface?.name || n.network?.name || `network-row-${idx}`}>
                {n.network?.name || n.iface?.name || NO_DATA_DASH}
              </StackItem>
            ))}
          </Stack>
        }
        title={t('Name')}
      />
      <WizardDescriptionItem
        description={
          <Stack>
            {networkData.map((n, idx) => (
              <StackItem key={n.iface?.name || n.network?.name || `network-label-${idx}`}>
                {getNetworkNameLabel(t, n) || NO_DATA_DASH}
              </StackItem>
            ))}
          </Stack>
        }
        title={t('Network')}
      />
      <WizardDescriptionItem
        description={
          <Stack>
            {networkData.map((n) => (
              <StackItem key={n.iface.name}>{getPrintableNetworkInterfaceType(n.iface)}</StackItem>
            ))}
          </Stack>
        }
        title={t('Type')}
      />
    </DescriptionList>
  );
});

export default NetworksTable;
