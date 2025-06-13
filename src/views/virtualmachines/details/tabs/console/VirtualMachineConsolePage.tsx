import React, { FC } from 'react';

import StableConsole from '@kubevirt-utils/components/Consoles/StableConsole';
import { getConsolePath } from '@kubevirt-utils/components/Consoles/utils/utils';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isHeadlessMode } from '@kubevirt-utils/resources/vm';
import useVMI from '@kubevirt-utils/resources/vm/hooks/useVMI';
import { isWindows } from '@kubevirt-utils/resources/vm/utils/operation-system/operationSystem';
import { Bullseye, EmptyState, EmptyStateBody, PageSection } from '@patternfly/react-core';
import { NavPageComponentProps } from '@virtualmachines/details/utils/types';

import { isRunning, printableVMStatus } from '../../../utils';

import './VirtualMachineConsolePage.scss';

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
    <PageSection className="VirtualMachineConsolePage-page-section" hasBodyWrapper={false}>
      <StableConsole
        consoleContainerClass="virtual-machine-console-page"
        isHeadlessMode={isHeadlessMode(vmi)}
        isVmRunning={true}
        isWindowsVM={isWindows(vmi)}
        path={getConsolePath({ name: vm?.metadata?.name, namespace: vm?.metadata?.namespace })}
      />
    </PageSection>
  );
};

export default VirtualMachineConsolePage;
