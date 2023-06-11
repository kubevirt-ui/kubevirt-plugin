import * as React from 'react';

import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { VirtualMachineInstanceModelGroupVersionKind } from '@kubevirt-utils/models';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { Bullseye } from '@patternfly/react-core';
import { printableVMStatus } from '@virtualmachines/utils';

import FileSystemListLayout from './FilesystemListLayout';

export type FilesystemListProps = {
  vm: V1VirtualMachine;
};

const FilesystemList: React.FC<FilesystemListProps> = ({ vm }) => {
  const { t } = useKubevirtTranslation();
  const [vmi] = useK8sWatchResource<V1VirtualMachineInstance>({
    groupVersionKind: VirtualMachineInstanceModelGroupVersionKind,
    isList: false,
    name: vm?.metadata?.name,
    namespace: vm?.metadata?.namespace,
  });
  const isVMRunning = vm?.status?.printableStatus === printableVMStatus.Running;

  const guestOS = vmi?.status?.guestOSInfo?.id;
  const noDataEmptyMsg = React.useMemo(() => {
    if (!isVMRunning) {
      return t('VirtualMachine is not running');
    } else if (!guestOS && isVMRunning) {
      return t('Guest agent is required');
    }
  }, [guestOS, isVMRunning, t]);

  return (
    <FileSystemListLayout
      noDataEmptyMsg={() => <Bullseye>{noDataEmptyMsg}</Bullseye>}
      vmi={isVMRunning ? vmi : null}
    />
  );
};

export default FilesystemList;
