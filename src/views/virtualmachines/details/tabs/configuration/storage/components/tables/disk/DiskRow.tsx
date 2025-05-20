import React, { FC } from 'react';

import DataVolumeModel from '@kubevirt-ui/kubevirt-api/console/models/DataVolumeModel';
import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { modelToGroupVersionKind, PersistentVolumeClaimModel } from '@kubevirt-utils/models';
import { getNamespace } from '@kubevirt-utils/resources/shared';
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

  const {
    drive,
    hasDataVolume,
    interface: iface,
    isBootDisk,
    isEnvDisk,
    name,
    namespace,
    size,
    source,
    storageClass,
  } = obj;

  const provisioningPercentage = provisioningPercentages?.[source];

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
                <span className="provisioning-popover-button">{name}</span>
              </Popover>
            ) : (
              name
            )}{' '}
            <HotplugLabel diskName={name} vm={vm} vmi={vmi} />
          </StackItem>
          {isBootDisk && (
            <StackItem>
              <Label className="disk-row-label-bootable" color="blue" variant="filled">
                {t('bootable')}
              </Label>
            </StackItem>
          )}
          {isEnvDisk && (
            <StackItem>
              <Label color="blue" variant="filled">
                {t('environment disk')}
              </Label>
            </StackItem>
          )}
        </Stack>
      </TableData>

      <TableData activeColumnIDs={activeColumnIDs} id="source">
        {sourcesLoaded && (hasPVC || hasDataVolume) && (
          <ResourceLink
            groupVersionKind={modelToGroupVersionKind(
              hasDataVolume ? DataVolumeModel : PersistentVolumeClaimModel,
            )}
            name={source}
            namespace={namespace || getNamespace(vm)}
          />
        )}

        {!sourcesLoaded && (hasPVC || hasDataVolume) && <Skeleton width="200px" />}

        {!hasPVC && source}
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} id="size">
        {readableSizeUnit(size)}
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} id="drive">
        {drive}
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} id="interface">
        {iface}
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} id="storage-class">
        {storageClass}
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} className="pf-v6-c-table__action" id="">
        <DiskRowActions customize={customize} obj={obj} onDiskUpdate={onSubmit} vm={vm} vmi={vmi} />
      </TableData>
    </>
  );
};

export default DiskRow;
