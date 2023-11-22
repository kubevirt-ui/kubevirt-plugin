import * as React from 'react';

import { V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useGuestOS } from '@kubevirt-utils/resources/vmi/hooks';
import { ListPageBody, VirtualizedTable } from '@openshift-console/dynamic-plugin-sdk';

import useFilesystemListColumns from '../../hooks/useFilesystemListColumns';

import FilesystemListTitle from './FilesystemListTitle';
import FilesystemRow from './FilesystemRow';

type FileSystemListLayoutProps = {
  noDataEmptyMsg?: any;
  vmi: V1VirtualMachineInstance;
};

const FileSystemListLayout: React.FC<FileSystemListLayoutProps> = ({ noDataEmptyMsg, vmi }) => {
  const [data, loaded] = useGuestOS(vmi);
  const columns = useFilesystemListColumns();
  const fileSystems = data?.fsInfo?.disks || [];

  return (
    <ListPageBody>
      <FilesystemListTitle />
      <VirtualizedTable
        columns={columns}
        data={fileSystems}
        loaded={loaded}
        loadError={null}
        NoDataEmptyMsg={noDataEmptyMsg}
        Row={FilesystemRow}
        unfilteredData={fileSystems}
      />
    </ListPageBody>
  );
};

export default FileSystemListLayout;
