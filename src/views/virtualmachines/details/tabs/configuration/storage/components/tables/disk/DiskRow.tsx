import React, { FC } from 'react';

import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { modelToGroupVersionKind, PersistentVolumeClaimModel } from '@kubevirt-utils/models';
import { NameWithPercentages } from '@kubevirt-utils/resources/vm/hooks/types';
import { DiskRowDataLayout } from '@kubevirt-utils/resources/vm/utils/disk/constants';
import { readableSizeUnit } from '@kubevirt-utils/utils/units';
import { ResourceLink, RowProps, TableData } from '@openshift-console/dynamic-plugin-sdk';
import {
  Label,
  Popover,
  PopoverPosition,
  Skeleton,
  Stack,
  StackItem,
} from '@patternfly/react-core';

import { isPVCSource } from './utils/helpers';
import DiskRowActions from './DiskRowActions';
import { HotplugLabel } from './HotplugLabel';

const DiskRow: FC<
  RowProps<
    DiskRowDataLayout,
    {
      customize?: boolean;
      onSubmit?: (updatedVM: V1VirtualMachine) => Promise<V1VirtualMachine>;
      provisioningPercentages: NameWithPercentages;
      sourcesLoaded?: boolean;
      vm: V1VirtualMachine;
      vmi?: V1VirtualMachineInstance;
    }
  >
> = ({
  activeColumnIDs,
  obj,
  rowData: { customize = false, onSubmit, provisioningPercentages, sourcesLoaded, vm, vmi },
}) => {
  const { t } = useKubevirtTranslation();

  const provisioningPercentage = provisioningPercentages?.[obj?.source];

  const hasPVC = isPVCSource(obj);

  return (
    <>
      <TableData activeColumnIDs={activeColumnIDs} id="name">
        <Stack>
          <StackItem>
            {provisioningPercentage ? (
              <Popover
                bodyContent={
                  <>
                    {t('Provisioning')} {provisioningPercentage}
                  </>
                }
                position={PopoverPosition.right}
              >
                <span className="provisioning-popover-button">{obj?.name}</span>
              </Popover>
            ) : (
              obj?.name
            )}{' '}
            <HotplugLabel diskName={obj?.name} vm={vm} vmi={vmi} />
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
        {sourcesLoaded && hasPVC && (
          <ResourceLink
            groupVersionKind={modelToGroupVersionKind(PersistentVolumeClaimModel)}
            name={obj?.source}
            namespace={obj?.namespace}
          />
        )}

        {!sourcesLoaded && hasPVC && <Skeleton width="200px" />}

        {!hasPVC && obj?.source}
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
        <DiskRowActions customize={customize} obj={obj} onDiskUpdate={onSubmit} vm={vm} vmi={vmi} />
      </TableData>
    </>
  );
};

export default DiskRow;
