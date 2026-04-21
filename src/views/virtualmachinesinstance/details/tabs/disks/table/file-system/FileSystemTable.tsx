import React, { FC } from 'react';

import { V1VirtualMachineInstance } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import FileSystemList from '@kubevirt-utils/components/FileSystemList/FileSystemList';
import { FileSystemData } from '@kubevirt-utils/components/FileSystemList/fileSystemListDefinition';
import { ListPageBody } from '@openshift-console/dynamic-plugin-sdk';

import useGuestOS from '../../../../hooks/useGuestOS';

import FileSystemTableTitle from './FileSystemTableTitle';

type FileSystemTableProps = {
  vmi: V1VirtualMachineInstance;
};

const FileSystemTable: FC<FileSystemTableProps> = ({ vmi }) => {
  const [data, loaded, loadingError] = useGuestOS(vmi);
  const fileSystems: FileSystemData[] = data?.fsInfo?.disks ?? [];

  return (
    <ListPageBody>
      <FileSystemTableTitle />
      <FileSystemList data={fileSystems} loaded={loaded} loadError={loadingError} />
    </ListPageBody>
  );
};

export default FileSystemTable;
