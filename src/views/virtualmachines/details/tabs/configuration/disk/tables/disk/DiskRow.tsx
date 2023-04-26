import * as React from 'react';

import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import {
  CONTAINER_EPHERMAL,
  OTHER,
} from '@kubevirt-utils/components/DiskModal/DiskFormFields/utils/constants';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { modelToGroupVersionKind, PersistentVolumeClaimModel } from '@kubevirt-utils/models';
import { DiskRowDataLayout } from '@kubevirt-utils/resources/vm/utils/disk/constants';
import { readableSizeUnit } from '@kubevirt-utils/utils/units';
import { ResourceLink, RowProps, TableData } from '@openshift-console/dynamic-plugin-sdk';
import { Label, Stack, StackItem } from '@patternfly/react-core';

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
        <Stack>
          <StackItem>
            {obj?.name} <HotplugLabel vm={vm} diskName={obj?.name} vmi={vmi} />
          </StackItem>
          {obj?.isBootDisk && (
            <StackItem>
              <Label variant="filled" color="blue" className="disk-row-label-bootable">
                {t('bootable')}
              </Label>
            </StackItem>
          )}
          {obj?.isEnvDisk && (
            <StackItem>
              <Label variant="filled" color="blue">
                {t('environment disk')}
              </Label>
            </StackItem>
          )}
        </Stack>
      </TableData>

      <TableData id="source" activeColumnIDs={activeColumnIDs}>
        {isPVCSource ? (
          <ResourceLink
            groupVersionKind={modelToGroupVersionKind(PersistentVolumeClaimModel)}
            name={obj?.source}
            namespace={obj?.namespace}
          />
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
        id=""
        activeColumnIDs={activeColumnIDs}
        className="dropdown-kebab-pf pf-c-table__action"
      >
        <DiskRowActions vm={vm} diskName={obj?.name} pvcResourceExists={isPVCSource} vmi={vmi} />
      </TableData>
    </>
  );
};

export default DiskRow;
