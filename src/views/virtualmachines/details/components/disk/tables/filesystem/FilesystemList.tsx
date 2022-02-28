import * as React from 'react';

import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { VirtualMachineInstanceModelGroupVersionKind } from '@kubevirt-utils/models';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';

import FileSystemTable from '../../../../../../virtualmachinesinstance/details/tabs/disks/table/file-system/FileSystemTable';

export type FilesystemListProps = {
  vm: V1VirtualMachine;
};

const FilesystemList: React.FC<FilesystemListProps> = ({ vm }) => {
  const { t } = useKubevirtTranslation();
  const [vmi, , loadError] = useK8sWatchResource<V1VirtualMachineInstance>({
    groupVersionKind: VirtualMachineInstanceModelGroupVersionKind,
    isList: false,
    name: vm?.metadata?.name,
    namespace: vm?.metadata?.namespace,
  });

  const guestOS = vmi?.status?.guestOSInfo?.id;
  let noDataEmptyMsg = undefined;
  if (loadError) {
    noDataEmptyMsg = () => <>{t('Virtual machine is not running')}</>;
  } else if (!guestOS) {
    noDataEmptyMsg = () => <>{t('Guest agent is required')}</>;
  }
  return <FileSystemTable vmi={vmi} noDataEmptyMsg={noDataEmptyMsg} />;
};

export default FilesystemList;
