import * as React from 'react';

import { V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useGuestOS } from '@kubevirt-utils/resources/vmi/hooks';
import { ListPageBody, VirtualizedTable } from '@openshift-console/dynamic-plugin-sdk';

import useFilesystemListColumns from '../../hooks/useFilesystemListColumns';

import FilesystemListTitle from './FilesystemListTitle';
import FilesystemRow from './FilesystemRow';

type FileSystemListLayoutProps = {
  vmi: V1VirtualMachineInstance;
  noDataEmptyMsg?: any;
};

const FileSystemListLayout: React.FC<FileSystemListLayoutProps> = ({ vmi, noDataEmptyMsg }) => {
  const [data, loaded] = useGuestOS(vmi);
  const columns = useFilesystemListColumns();
  const fileSystems = data?.fsInfo?.disks || [];

  return (
    <ListPageBody>
      <FilesystemListTitle />
      <VirtualizedTable
        data={fileSystems}
        unfilteredData={fileSystems}
        loaded={loaded}
        loadError={null}
        columns={columns}
        Row={FilesystemRow}
        NoDataEmptyMsg={noDataEmptyMsg}
      />
    </ListPageBody>
  );
};

export default FileSystemListLayout;
