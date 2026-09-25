import { type FC } from 'react';
import produce from 'immer';

import {
  type V1Disk,
  type V1Interface,
  type V1Network,
  type V1VirtualMachine,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import SearchItem from '@kubevirt-utils/components/SearchItem/SearchItem';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ensurePath } from '@kubevirt-utils/utils/utils';
import { PageSection, Title } from '@patternfly/react-core';
import AddNetworkInterfaceButton from '@virtualmachines/details/tabs/configuration/network/components/AddNetworkInterfaceButton';
import { useWizardVMDraft } from '@virtualmachines/wizard/hooks/useWizardVMDraft';
import NetworkInterfaceList from '@virtualmachines/wizard/steps/CustomizationStep/components/CustomizeVirtualMachine/components/CustomizeVMTabs/tabs/network/NetworkInterfaceList';

const CustomizeInstanceTypeNetworkTab: FC = () => {
  const { t } = useKubevirtTranslation();
  const { replaceDraft, vmDraft: vm } = useWizardVMDraft();

  if (!vm) {
    return <Loading />;
  }

  const onAddNetworkInterface = (
    updatedNetworks: V1Network[],
    updatedInterfaces: V1Interface[],
    updatedDisks?: V1Disk[],
  ): Promise<V1VirtualMachine> => {
    const patchedVM = replaceDraft(
      produce(vm, (draft) => {
        ensurePath(draft, 'spec.template.spec.domain.devices');
        draft.spec.template.spec.networks = updatedNetworks;
        draft.spec.template.spec.domain.devices.interfaces = updatedInterfaces;
        if (updatedDisks) draft.spec.template.spec.domain.devices.disks = updatedDisks;
      }),
      vm,
    );

    return Promise.resolve(patchedVM ?? vm);
  };

  const onUpdateVM = (updatedVM: V1VirtualMachine): Promise<void> => {
    replaceDraft(updatedVM, vm);
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
