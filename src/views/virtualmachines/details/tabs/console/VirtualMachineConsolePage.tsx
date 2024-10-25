import React, { FC } from 'react';

import { VirtualMachineInstanceModelGroupVersionKind } from '@kubevirt-ui/kubevirt-api/console';
import { V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
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
import { NavPageComponentProps } from '@virtualmachines/details/utils/types';

import { printableVMStatus } from '../../../utils';

import VirtualMachineConsolePageTitle from './components/VirtualMachineConsolePageTitle';

import './VirtualMachineConsolePage.scss';

const VirtualMachineConsolePage: FC<NavPageComponentProps> = ({ obj: vm }) => {
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
      <PageSection
        className="VirtualMachineConsolePage-page-section"
        variant={PageSectionVariants.light}
      >
        <Consoles consoleContainerClass="virtual-machine-console-page" vmi={vmi} />
      </PageSection>
    </>
  );
};

export default VirtualMachineConsolePage;
