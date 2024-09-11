import React, { FC } from 'react';

import { V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { PageSection, PageSectionVariants } from '@patternfly/react-core';

import DisksTable from './table/disks/DisksTable';
import FileSystemTable from './table/file-system/FileSystemTable';

import './VirtualMachinesInstancePageDisksTab.scss';

type VirtualMachinesInstancePageDisksTabProps = {
  obj: V1VirtualMachineInstance;
};

const VirtualMachinesInstancePageDisksTab: FC<VirtualMachinesInstancePageDisksTabProps> = ({
  obj: vmi,
}) => (
  <PageSection variant={PageSectionVariants.light}>
    <DisksTable vmi={vmi} />
    <FileSystemTable vmi={vmi} />
  </PageSection>
);

export default VirtualMachinesInstancePageDisksTab;
