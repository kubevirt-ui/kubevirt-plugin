import React, { FC } from 'react';

import { VirtualMachineInstanceModelGroupVersionKind } from '@kubevirt-ui/kubevirt-api/console';
import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import Consoles from '@kubevirt-utils/components/Consoles/Consoles';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import {
  Bullseye,
  EmptyState,
  EmptyStateBody,
  PageSection,
  PageSectionVariants,
} from '@patternfly/react-core';

import { printableVMStatus } from '../../../utils';

import VirtualMachineConsolePageTitle from './components/VirtualMachineConsolePageTitle';

type VirtualMachineConsolePageProps = {
  obj: V1VirtualMachine;
};

const VirtualMachineConsolePage: FC<VirtualMachineConsolePageProps> = ({ obj: vm }) => {
  const { t } = useKubevirtTranslation();
  const [vmi, vmiLoaded] = useK8sWatchResource<V1VirtualMachineInstance>({
    groupVersionKind: VirtualMachineInstanceModelGroupVersionKind,
    isList: false,
    name: vm?.metadata?.name,
    namespace: vm?.metadata?.namespace,
  });

  if (!vmi || vm?.status?.printableStatus === printableVMStatus.Stopped) {
    return (
      <>
        <VirtualMachineConsolePageTitle />
        <EmptyState>
          <EmptyStateBody>
            {t('This VirtualMachine is down. Please start it to access its console.')}
          </EmptyStateBody>
        </EmptyState>
      </>
    );
  }

  if (!vmiLoaded) {
    return (
      <>
        <VirtualMachineConsolePageTitle />
        <Bullseye>
          <Loading />
        </Bullseye>
      </>
    );
  }

  return (
    <>
      <VirtualMachineConsolePageTitle />
      <PageSection variant={PageSectionVariants.light}>
        <Consoles vmi={vmi} />
      </PageSection>
    </>
  );
};

export default VirtualMachineConsolePage;
