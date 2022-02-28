import * as React from 'react';

import { V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { ListPageBody, VirtualizedTable } from '@openshift-console/dynamic-plugin-sdk';

import useFileSystemTableColumns from '../../hooks/useFileSystemTableColumns';
import useFileSystemTableGuestOS from '../../hooks/useFileSystemTableGuestOS';

import FileSystemTableRow from './FileSystemTableRow';
import FileSystemTableTitle from './FileSystemTableTitle';

type FileSystemTableProps = {
  vmi: V1VirtualMachineInstance;
  noDataEmptyMsg?: any;
};

const FileSystemTable: React.FC<FileSystemTableProps> = ({ vmi, noDataEmptyMsg }) => {
  const [data, loaded, loadingError] = useFileSystemTableGuestOS(vmi);
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
          NoDataEmptyMsg={noDataEmptyMsg}
        />
      </ListPageBody>
    </>
  );
};

export default FileSystemTable;
