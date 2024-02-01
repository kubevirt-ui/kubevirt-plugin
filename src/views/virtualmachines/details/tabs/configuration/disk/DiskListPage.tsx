import React, { FC, useCallback } from 'react';

import VirtualMachineModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineModel';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import SidebarEditor from '@kubevirt-utils/components/SidebarEditor/SidebarEditor';
import { PATHS_TO_HIGHLIGHT } from '@kubevirt-utils/resources/vm/utils/constants';
import { k8sUpdate } from '@openshift-console/dynamic-plugin-sdk';

import { ConfigurationInnerTabProps } from '../utils/types';

import DiskList from './tables/disk/DiskList';
import FilesystemList from './tables/filesystem/FilesystemList';

import './disk-list-page.scss';

const DiskListPage: FC<ConfigurationInnerTabProps> = ({ vm: obj }) => {
  const onSubmit = useCallback(
    (updatedVM: V1VirtualMachine) =>
      k8sUpdate({
        data: updatedVM,
        model: VirtualMachineModel,
        name: updatedVM?.metadata?.name,
        ns: updatedVM?.metadata?.namespace,
      }),
    [],
  );

  return (
    <div className="disk-list-page">
      <SidebarEditor
        onResourceUpdate={onSubmit}
        pathsToHighlight={PATHS_TO_HIGHLIGHT.DISKS_TAB}
        resource={obj}
      >
        <DiskList vm={obj} />
        <FilesystemList vm={obj} />
      </SidebarEditor>
    </div>
  );
};

export default DiskListPage;
