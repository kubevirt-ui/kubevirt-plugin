import * as React from 'react';

import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { VirtualMachineInstanceModelGroupVersionKind } from '@kubevirt-utils/models';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';

import { printableVMStatus } from '../../../../../utils';

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

  const guestOS = vmi?.status?.guestOSInfo?.id;
  let noDataEmptyMsg = undefined;
  if (vm?.status?.printableStatus !== printableVMStatus.Running) {
    noDataEmptyMsg = () => <>{t('VirtualMachine is not running')}</>;
  } else if (!guestOS && vmi?.metadata) {
    noDataEmptyMsg = () => <>{t('Guest agent is required')}</>;
  }
  return <FileSystemListLayout vmi={vmi} noDataEmptyMsg={noDataEmptyMsg} />;
};

export default FilesystemList;
