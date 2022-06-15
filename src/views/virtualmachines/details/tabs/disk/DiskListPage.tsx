import * as React from 'react';
import { RouteComponentProps } from 'react-router';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';

import DiskList from './tables/disk/DiskList';
import FilesystemList from './tables/filesystem/FilesystemList';

type DiskListPageProps = RouteComponentProps<{
  ns: string;
  name: string;
}> & {
  obj?: V1VirtualMachine;
};

const DiskListPage: React.FC<DiskListPageProps> = ({ obj }) => {
  return (
    <>
      <DiskList vm={obj} />
      <FilesystemList vm={obj} />
    </>
  );
};

export default DiskListPage;
