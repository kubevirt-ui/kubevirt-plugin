import * as React from 'react';
import { RouteComponentProps } from 'react-router';

import VirtualMachineModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineModel';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import SidebarEditor from '@kubevirt-utils/components/SidebarEditor/SidebarEditor';
import { k8sUpdate } from '@openshift-console/dynamic-plugin-sdk';

import DiskList from './tables/disk/DiskList';
import FilesystemList from './tables/filesystem/FilesystemList';

import './disk-list-page.scss';

type DiskListPageProps = RouteComponentProps<{
  ns: string;
  name: string;
}> & {
  obj?: V1VirtualMachine;
};

const DiskListPage: React.FC<DiskListPageProps> = ({ obj }) => {
  const onSubmit = React.useCallback(
    (updatedVM: V1VirtualMachine) =>
      k8sUpdate({
        model: VirtualMachineModel,
        data: updatedVM,
        ns: updatedVM?.metadata?.namespace,
        name: updatedVM?.metadata?.name,
      }),
    [],
  );

  return (
    <div className="disk-list-page">
      <SidebarEditor resource={obj} onResourceUpdate={onSubmit}>
        <DiskList vm={obj} />
        <FilesystemList vm={obj} />
      </SidebarEditor>
    </div>
  );
};

export default DiskListPage;
