import * as React from 'react';
import { RouteComponentProps } from 'react-router';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';

import FilesystemList from '../filesystem/FilesystemList';

import DiskList from './DiskList';

type DiskListPageProps = RouteComponentProps<{
  ns: string;
  name: string;
}> & {
  obj?: V1VirtualMachine;
};

const DiskListPage: React.FC<DiskListPageProps> = ({ obj }) => {
  return (
    <div className="VirtualMachinesInstancePageDisksTab">
      <DiskList vm={obj} />
      <FilesystemList vm={obj} />
    </div>
  );
};

export default DiskListPage;
