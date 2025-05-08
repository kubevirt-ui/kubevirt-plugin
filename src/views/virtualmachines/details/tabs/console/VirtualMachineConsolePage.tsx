import React, { FC } from 'react';

import { VirtualMachineInstanceModelGroupVersionKind } from '@kubevirt-ui/kubevirt-api/console';
import { V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import Consoles from '@kubevirt-utils/components/Consoles/Consoles';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Bullseye, EmptyState, EmptyStateBody, PageSection } from '@patternfly/react-core';
import { useFleetK8sWatchResource } from '@stolostron/multicluster-sdk';
import { NavPageComponentProps } from '@virtualmachines/details/utils/types';

import { printableVMStatus } from '../../../utils';

import './VirtualMachineConsolePage.scss';

const VirtualMachineConsolePage: FC<NavPageComponentProps> = ({ obj: vm }) => {
  const { t } = useKubevirtTranslation();
  const [vmi, vmiLoaded] = useFleetK8sWatchResource<V1VirtualMachineInstance>({
    cluster: vm?.cluster,
    groupVersionKind: VirtualMachineInstanceModelGroupVersionKind,
    isList: false,
    name: vm?.metadata?.name,
    namespace: vm?.metadata?.namespace,
  });

  if (!vmi || vm?.status?.printableStatus === printableVMStatus.Stopped) {
    return (
      <EmptyState>
        <EmptyStateBody>
          {t('This VirtualMachine is down. Please start it to access its console.')}
        </EmptyStateBody>
      </EmptyState>
    );
  }

  if (!vmiLoaded) {
    return (
      <Bullseye>
        <Loading />
      </Bullseye>
    );
  }

  return (
    <PageSection className="VirtualMachineConsolePage-page-section" hasBodyWrapper={false}>
      <Consoles consoleContainerClass="virtual-machine-console-page" vmi={vmi} />
    </PageSection>
  );
};

export default VirtualMachineConsolePage;
