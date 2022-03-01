import * as React from 'react';

import { V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { ListPageBody, VirtualizedTable } from '@openshift-console/dynamic-plugin-sdk';

import useFilesystemListColumns from '../../hooks/useFilesystemListColumns';
import useFilesystemListGuestOS from '../../hooks/useFilesystemListGuestOS';

import FilesystemListTitle from './FilesystemListTitle';
import FilesystemRow from './FilesystemRow';

type FileSystemListLayoutProps = {
  vmi: V1VirtualMachineInstance;
  noDataEmptyMsg?: any;
};

const FileSystemListLayout: React.FC<FileSystemListLayoutProps> = ({ vmi, noDataEmptyMsg }) => {
  const [data, loaded, loadingError] = useFilesystemListGuestOS(vmi);
  const columns = useFilesystemListColumns();
  const fileSystems = data?.fsInfo?.disks || [];

  return (
    <ListPageBody>
      <FilesystemListTitle />
      <VirtualizedTable
        data={fileSystems}
        unfilteredData={fileSystems}
        loaded={loaded}
        loadError={loadingError}
        columns={columns}
        Row={FilesystemRow}
        NoDataEmptyMsg={noDataEmptyMsg}
      />
    </ListPageBody>
  );
};

export default FileSystemListLayout;
