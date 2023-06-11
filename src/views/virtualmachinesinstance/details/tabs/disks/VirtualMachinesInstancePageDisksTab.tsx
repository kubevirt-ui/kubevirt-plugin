import React, { FC } from 'react';
import { RouteComponentProps } from 'react-router';

import { V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';

import DisksTable from './table/disks/DisksTable';
import FileSystemTable from './table/file-system/FileSystemTable';

import './VirtualMachinesInstancePageDisksTab.scss';

type VirtualMachinesInstancePageDisksTabProps = RouteComponentProps<{
  name: string;
  ns: string;
}> & {
  obj: V1VirtualMachineInstance;
};

const VirtualMachinesInstancePageDisksTab: FC<VirtualMachinesInstancePageDisksTabProps> = ({
  obj: vmi,
}) => (
  <div className="VirtualMachinesInstancePageDisksTab">
    <DisksTable vmi={vmi} />
    <FileSystemTable vmi={vmi} />
  </div>
);

export default VirtualMachinesInstancePageDisksTab;
