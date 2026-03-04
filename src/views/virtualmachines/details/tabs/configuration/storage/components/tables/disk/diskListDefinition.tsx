import React, { FC, ReactNode, useMemo } from 'react';
import { TFunction } from 'react-i18next';

import { DataVolumeModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { ColumnConfig } from '@kubevirt-utils/hooks/useDataViewTableSort/types';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { modelToGroupVersionKind, PersistentVolumeClaimModel } from '@kubevirt-utils/models';
import { getNamespace } from '@kubevirt-utils/resources/shared';
import { getDisks } from '@kubevirt-utils/resources/vm';
import { NameWithPercentages } from '@kubevirt-utils/resources/vm/hooks/types';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import { DiskRowDataLayout } from '@kubevirt-utils/resources/vm/utils/disk/constants';
import { isCDROMDisk } from '@kubevirt-utils/resources/vm/utils/disk/selectors';
import { readableSizeUnit } from '@kubevirt-utils/utils/units';
import MulticlusterResourceLink from '@multicluster/components/MulticlusterResourceLink/MulticlusterResourceLink';
import { getCluster } from '@multicluster/helpers/selectors';
import {
  Button,
  ButtonVariant,
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
import ISOBadge from './ISOBadge';

import '../tables.scss';

export type DiskListCallbacks = {
  customize?: boolean;
  onSubmit?: (updatedVM: V1VirtualMachine) => Promise<V1VirtualMachine>;
  provisioningPercentages: NameWithPercentages;
  sourcesLoaded?: boolean;
  vm: V1VirtualMachine;
  vmi?: V1VirtualMachineInstance;
};

type NameCellProps = {
  callbacks: DiskListCallbacks;
  row: DiskRowDataLayout;
};

const NameCell: FC<NameCellProps> = ({ callbacks, row }) => {
  const { t } = useKubevirtTranslation();
  const { provisioningPercentages, vm, vmi } = callbacks;
  const { isBootDisk, isEnvDisk, name, source } = row;

  const provisioningPercentage = provisioningPercentages?.[source];

  const { displayName } = useMemo(() => {
    const disks = getDisks(vm) ?? [];
    const foundDisk = disks.find((disk) => disk.name === name);
    const cdrom = foundDisk && isCDROMDisk(foundDisk);
    const cdromName = t('CD-ROM');
    return {
      displayName: cdrom ? cdromName : name,
    };
  }, [vm, name, t]);

  return (
    <Stack data-test-id={`disk-${name}`}>
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
            <Button
              aria-label={t('{{name}}, provisioning {{percentage}}', {
                name: displayName,
                percentage: provisioningPercentage,
              })}
              className="provisioning-popover-button"
              isInline
              variant={ButtonVariant.link}
            >
              {displayName}
            </Button>
          </Popover>
        ) : (
          displayName
        )}{' '}
        <HotplugLabel diskName={name} vm={vm} vmi={vmi} />
        <ISOBadge diskName={name} vm={vm} />
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
  );
};

type SourceCellProps = {
  callbacks: DiskListCallbacks;
  row: DiskRowDataLayout;
};

const SourceCell: FC<SourceCellProps> = ({ callbacks, row }) => {
  const { sourcesLoaded, vm } = callbacks;
  const { hasDataVolume, namespace, source } = row;

  const hasPVC = isPVCSource(row);

  if (!sourcesLoaded && (hasPVC || hasDataVolume)) {
    return <Skeleton width="200px" />;
  }

  if (sourcesLoaded && (hasPVC || hasDataVolume)) {
    return (
      <MulticlusterResourceLink
        groupVersionKind={modelToGroupVersionKind(
          hasDataVolume ? DataVolumeModel : PersistentVolumeClaimModel,
        )}
        cluster={getCluster(vm)}
        name={source}
        namespace={namespace ?? getNamespace(vm)}
      />
    );
  }

  return <span data-test-id={`disk-source-${row.name}`}>{source ?? NO_DATA_DASH}</span>;
};

const renderActionsCell = (row: DiskRowDataLayout, callbacks: DiskListCallbacks): ReactNode => {
  const { customize, onSubmit, vm, vmi } = callbacks;
  return (
    <DiskRowActions customize={customize} obj={row} onDiskUpdate={onSubmit} vm={vm} vmi={vmi} />
  );
};

export const getDiskListColumns = (
  t: TFunction,
): ColumnConfig<DiskRowDataLayout, DiskListCallbacks>[] => [
  {
    getValue: (row) => row.name ?? '',
    key: 'name',
    label: t('Name'),
    renderCell: (row, callbacks) => <NameCell callbacks={callbacks} row={row} />,
    sortable: true,
  },
  {
    getValue: (row) => row.source ?? '',
    key: 'source',
    label: t('Source'),
    renderCell: (row, callbacks) => <SourceCell callbacks={callbacks} row={row} />,
    sortable: true,
  },
  {
    getValue: (row) => row.size ?? '',
    key: 'size',
    label: t('Size'),
    renderCell: (row) => (
      <span data-test-id={`disk-size-${row.name}`}>
        {readableSizeUnit(row.size) ?? NO_DATA_DASH}
      </span>
    ),
    sortable: true,
  },
  {
    getValue: (row) => row.drive ?? '',
    key: 'drive',
    label: t('Drive'),
    renderCell: (row) => (
      <span data-test-id={`disk-drive-${row.name}`}>{row.drive ?? NO_DATA_DASH}</span>
    ),
    sortable: true,
  },
  {
    getValue: (row) => row.interface ?? '',
    key: 'interface',
    label: t('Interface'),
    renderCell: (row) => (
      <span data-test-id={`disk-interface-${row.name}`}>{row.interface ?? NO_DATA_DASH}</span>
    ),
    sortable: true,
  },
  {
    getValue: (row) => row.storageClass ?? '',
    key: 'storage-class',
    label: t('Storage class'),
    renderCell: (row) => (
      <span data-test-id={`disk-storage-class-${row.name}`}>
        {row.storageClass ?? NO_DATA_DASH}
      </span>
    ),
    sortable: true,
  },
  {
    key: 'actions',
    label: '',
    props: { className: 'pf-v6-c-table__action' },
    renderCell: renderActionsCell,
  },
];

export const getDiskRowId = (row: DiskRowDataLayout): string =>
  `${row.name ?? 'unknown'}-${row.source ?? 'no-source'}`;
