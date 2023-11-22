import React, { FC, useMemo } from 'react';

import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { VirtualMachineInstanceModelGroupVersionKind } from '@kubevirt-utils/models';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { Bullseye } from '@patternfly/react-core';
import { isRunning } from '@virtualmachines/utils';

import FileSystemListLayout from './FilesystemListLayout';

export type FilesystemListProps = {
  vm: V1VirtualMachine;
};

const FilesystemList: FC<FilesystemListProps> = ({ vm }) => {
  const { t } = useKubevirtTranslation();
  const [vmi] = useK8sWatchResource<V1VirtualMachineInstance>({
    groupVersionKind: VirtualMachineInstanceModelGroupVersionKind,
    isList: false,
    name: vm?.metadata?.name,
    namespace: vm?.metadata?.namespace,
  });
  const isVMRunning = isRunning(vm);

  const guestOS = vmi?.status?.guestOSInfo?.id;
  const noDataEmptyMsg = useMemo(() => {
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
