import * as React from 'react';

import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import {
  CONTAINER_EPHERMAL,
  OTHER,
} from '@kubevirt-utils/components/DiskModal/DiskFormFields/utils/constants';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { PersistentVolumeClaimModel } from '@kubevirt-utils/models';
import { DiskRowDataLayout } from '@kubevirt-utils/resources/vm/utils/disk/constants';
import { readableSizeUnit } from '@kubevirt-utils/utils/units';
import { ResourceLink, RowProps, TableData } from '@openshift-console/dynamic-plugin-sdk';
import { Label, Split, SplitItem } from '@patternfly/react-core';

import DiskRowActions from './DiskRowActions';
import { HotplugLabel } from './HotplugLabel';

const DiskRow: React.FC<
  RowProps<DiskRowDataLayout, { vm: V1VirtualMachine; vmi?: V1VirtualMachineInstance }>
> = ({ obj, activeColumnIDs, rowData: { vm, vmi } }) => {
  const { t } = useKubevirtTranslation();
  const isPVCSource = ![CONTAINER_EPHERMAL, OTHER].includes(obj?.source);

  return (
    <>
      <TableData id="name" activeColumnIDs={activeColumnIDs}>
        <Split hasGutter>
          <SplitItem>
            {obj?.name} <HotplugLabel vm={vm} diskName={obj?.name} vmi={vmi} />
          </SplitItem>
          {obj?.isBootDisk && (
            <SplitItem>
              <Label variant="filled" color="blue">
                {t('bootable')}
              </Label>
            </SplitItem>
          )}
        </Split>
      </TableData>

      <TableData id="source" activeColumnIDs={activeColumnIDs}>
        {isPVCSource ? (
          <ResourceLink kind={PersistentVolumeClaimModel.kind} name={obj?.source} />
        ) : (
          obj?.source
        )}
      </TableData>
      <TableData id="size" activeColumnIDs={activeColumnIDs}>
        {readableSizeUnit(obj?.size)}
      </TableData>
      <TableData id="drive" activeColumnIDs={activeColumnIDs}>
        {obj?.drive}
      </TableData>
      <TableData id="interface" activeColumnIDs={activeColumnIDs}>
        {obj?.interface}
      </TableData>
      <TableData id="storage-class" activeColumnIDs={activeColumnIDs}>
        {obj?.storageClass}
      </TableData>
      <TableData
        id="actions"
        activeColumnIDs={activeColumnIDs}
        className="dropdown-kebab-pf pf-c-table__action"
      >
        <DiskRowActions vm={vm} diskName={obj?.name} pvcResourceExists={isPVCSource} vmi={vmi} />
      </TableData>
    </>
  );
};

export default DiskRow;
