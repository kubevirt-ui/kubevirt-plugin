import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';

import { VirtualMachineInstanceModelGroupVersionKind } from '@kubevirt-ui/kubevirt-api/console';
import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import Consoles from '@kubevirt-utils/components/Consoles/Consoles';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { Bullseye, EmptyState, EmptyStateBody, PageSection } from '@patternfly/react-core';

import { printableVMStatus } from '../../../utils';

type VirtualMachineConsolePageProps = RouteComponentProps & {
  obj: V1VirtualMachine;
};

const VirtualMachineConsolePage: React.FC<VirtualMachineConsolePageProps> = ({ obj: vm }) => {
  const { t } = useKubevirtTranslation();
  const [vmi, vmiLoaded] = useK8sWatchResource<V1VirtualMachineInstance>({
    groupVersionKind: VirtualMachineInstanceModelGroupVersionKind,
    name: vm?.metadata?.name,
    namespace: vm?.metadata?.namespace,
    isList: false,
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
    <PageSection>
      <Consoles vmi={vmi} />
    </PageSection>
  );
};

export default VirtualMachineConsolePage;
