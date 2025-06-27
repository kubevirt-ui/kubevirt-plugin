import React, { FC } from 'react';

import Consoles from '@kubevirt-utils/components/Consoles/Consoles';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useVMI from '@kubevirt-utils/resources/vm/hooks/useVMI';
import { Bullseye, EmptyState, EmptyStateBody, PageSection } from '@patternfly/react-core';
import { NavPageComponentProps } from '@virtualmachines/details/utils/types';

import { isRunning, printableVMStatus } from '../../../utils';

const VirtualMachineConsolePage: FC<NavPageComponentProps> = ({ obj: vm }) => {
  const { t } = useKubevirtTranslation();
  const { vmi, vmiLoaded } = useVMI(vm?.metadata?.name, vm?.metadata?.namespace, isRunning(vm));

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
    <PageSection className="virtual-machine-console-page-section" hasBodyWrapper={false}>
      <Consoles consoleContainerClass="virtual-machine-console-page" vmi={vmi} />
    </PageSection>
  );
};

export default VirtualMachineConsolePage;
