import * as React from 'react';
import { RouteComponentProps } from 'react-router';

import { V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';

import DisksTable from './table/disks/DisksTable';
import FileSystemTable from './table/file-system/FileSystemTable';

import './virtual-machines-insance-page-disks-tab.scss';

type VirtualMachinesInstancePageDisksTabProps = RouteComponentProps<{
  ns: string;
  name: string;
}> & {
  obj: V1VirtualMachineInstance;
};

const VirtualMachinesInstancePageDisksTab: React.FC<VirtualMachinesInstancePageDisksTabProps> = ({
  obj: vmi,
}) => {
  return (
    <div className="VirtualMachinesInstancePageDisksTab">
      <DisksTable vmi={vmi} />
      <FileSystemTable vmi={vmi} />
    </div>
  );
};

export default VirtualMachinesInstancePageDisksTab;
