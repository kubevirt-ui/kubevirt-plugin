import React, { FC } from 'react';

import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { modelToGroupVersionKind, PersistentVolumeClaimModel } from '@kubevirt-utils/models';
import { DiskRowDataLayout } from '@kubevirt-utils/resources/vm/utils/disk/constants';
import { readableSizeUnit } from '@kubevirt-utils/utils/units';
import { ResourceLink, RowProps, TableData } from '@openshift-console/dynamic-plugin-sdk';
import { Label, Stack, StackItem } from '@patternfly/react-core';

import { isPVCSource } from './utils/helpers';
import DiskRowActions from './DiskRowActions';
import { HotplugLabel } from './HotplugLabel';

const DiskRow: FC<
  RowProps<DiskRowDataLayout, { vm: V1VirtualMachine; vmi?: V1VirtualMachineInstance }>
> = ({ activeColumnIDs, obj, rowData: { vm, vmi } }) => {
  const { t } = useKubevirtTranslation();

  return (
    <>
      <TableData activeColumnIDs={activeColumnIDs} id="name">
        <Stack>
          <StackItem>
            {obj?.name} <HotplugLabel diskName={obj?.name} vm={vm} vmi={vmi} />
          </StackItem>
          {obj?.isBootDisk && (
            <StackItem>
              <Label className="disk-row-label-bootable" color="blue" variant="filled">
                {t('bootable')}
              </Label>
            </StackItem>
          )}
          {obj?.isEnvDisk && (
            <StackItem>
              <Label color="blue" variant="filled">
                {t('environment disk')}
              </Label>
            </StackItem>
          )}
        </Stack>
      </TableData>

      <TableData activeColumnIDs={activeColumnIDs} id="source">
        {isPVCSource(obj) ? (
          <ResourceLink
            groupVersionKind={modelToGroupVersionKind(PersistentVolumeClaimModel)}
            name={obj?.source}
            namespace={obj?.namespace}
          />
        ) : (
          obj?.source
        )}
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} id="size">
        {readableSizeUnit(obj?.size)}
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} id="drive">
        {obj?.drive}
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} id="interface">
        {obj?.interface}
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} id="storage-class">
        {obj?.storageClass}
      </TableData>
      <TableData
        activeColumnIDs={activeColumnIDs}
        className="dropdown-kebab-pf pf-v5-c-table__action"
        id=""
      >
        <DiskRowActions obj={obj} vm={vm} vmi={vmi} />
      </TableData>
    </>
  );
};

export default DiskRow;
