import { type FC } from 'react';
import { useWatch } from 'react-hook-form';

import {
  type V1Disk,
  type V1Interface,
  type V1Network,
  type V1VirtualMachine,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import SearchItem from '@kubevirt-utils/components/SearchItem/SearchItem';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { PageSection, Title } from '@patternfly/react-core';
import AddNetworkInterfaceButton from '@virtualmachines/details/tabs/configuration/network/components/AddNetworkInterfaceButton';
import { useVMWizard } from '@virtualmachines/wizard/state/vm-wizard-context/VMWizardContext';
import NetworkInterfaceList from '@virtualmachines/wizard/steps/CustomizationStep/components/CustomizeVirtualMachine/components/CustomizeVMTabs/tabs/network/NetworkInterfaceList';
import {
  patchWizardCustomizedVM,
  type PatchWizardCustomizedVMArgs,
} from '@virtualmachines/wizard/utils/patchWizardCustomizedVM';

const CustomizeInstanceTypeNetworkTab: FC = () => {
  const { t } = useKubevirtTranslation();
  const { getValues, setValue } = useVMWizard();
  const { control } = useVMWizard();
  const vm = useWatch({ control, name: 'customization.vmDraft' });

  if (!vm) {
    return <Loading />;
  }

  const onAddNetworkInterface = (
    updatedNetworks: V1Network[],
    updatedInterfaces: V1Interface[],
    updatedDisks?: V1Disk[],
  ): Promise<V1VirtualMachine> => {
    const updates: PatchWizardCustomizedVMArgs = [
      { data: updatedNetworks, path: 'spec.template.spec.networks' },
      { data: updatedInterfaces, path: 'spec.template.spec.domain.devices.interfaces' },
    ];
    if (updatedDisks) {
      updates.push({ data: updatedDisks, path: 'spec.template.spec.domain.devices.disks' });
    }
    const patchedVM = patchWizardCustomizedVM(getValues, setValue, updates);

    return Promise.resolve(patchedVM ?? vm);
  };

  const onUpdateVM = (updatedVM: V1VirtualMachine): Promise<void> => {
    patchWizardCustomizedVM(getValues, setValue, [{ data: updatedVM }]);
    return Promise.resolve();
  };

  return (
    <PageSection>
      <Title headingLevel="h2">
        <SearchItem id="network">{t('Network interfaces')}</SearchItem>
      </Title>
      <AddNetworkInterfaceButton onAddNetworkInterface={onAddNetworkInterface} vm={vm} />
      <NetworkInterfaceList onUpdateVM={onUpdateVM} vm={vm} />
    </PageSection>
  );
};

export default CustomizeInstanceTypeNetworkTab;
