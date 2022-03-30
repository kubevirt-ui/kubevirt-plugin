import * as React from 'react';

import { V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { ListPageBody, VirtualizedTable } from '@openshift-console/dynamic-plugin-sdk';

import useGuestOS from '../../../../hooks/useGuestOS';
import useFileSystemTableColumns from '../../hooks/useFileSystemTableColumns';

import FileSystemTableRow from './FileSystemTableRow';
import FileSystemTableTitle from './FileSystemTableTitle';

type FileSystemTableProps = {
  vmi: V1VirtualMachineInstance;
};

const FileSystemTable: React.FC<FileSystemTableProps> = ({ vmi }) => {
  const [data, loaded, loadingError] = useGuestOS(vmi);
  const columns = useFileSystemTableColumns();
  const fileSystems = data?.fsInfo?.disks || [];

  return (
    <>
      <FileSystemTableTitle />
      <ListPageBody>
        <VirtualizedTable
          data={fileSystems}
          unfilteredData={fileSystems}
          loaded={loaded}
          loadError={loadingError}
          columns={columns}
          Row={FileSystemTableRow}
        />
      </ListPageBody>
    </>
  );
};

export default FileSystemTable;
