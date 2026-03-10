import React, { FC, ReactNode } from 'react';
import { TFunction } from 'react-i18next';

import { ColumnConfig } from '@kubevirt-utils/hooks/useDataViewTableSort/types';
import { modelToGroupVersionKind, ProjectModel } from '@kubevirt-utils/models';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import { ResourceLink } from '@openshift-console/dynamic-plugin-sdk';

import { ProjectWithVMCount } from '../../types';

const NameCell: FC<{ row: ProjectWithVMCount }> = ({ row }) => {
  const { projectName } = row;

  if (!projectName) {
    return <span data-test="project-name">{NO_DATA_DASH}</span>;
  }

  return (
    <span data-test={`project-name-${projectName}`}>
      <ResourceLink groupVersionKind={modelToGroupVersionKind(ProjectModel)} name={projectName} />
    </span>
  );
};

const VMCountCell: FC<{ row: ProjectWithVMCount }> = ({ row }) => {
  const { projectName, vmCount } = row;

  return <span data-test={`project-vmcount-${projectName}`}>{vmCount}</span>;
};

export const getConnectedProjectsColumns = (t: TFunction): ColumnConfig<ProjectWithVMCount>[] => [
  {
    getValue: (row) => row.projectName ?? '',
    key: 'name',
    label: t('Name'),
    renderCell: (row): ReactNode => <NameCell row={row} />,
    sortable: true,
  },
  {
    getValue: (row) => row.vmCount,
    key: 'connected-vms',
    label: t('Connected virtual machines'),
    renderCell: (row): ReactNode => <VMCountCell row={row} />,
    sortable: true,
  },
];

export const getConnectedProjectRowId = (row: ProjectWithVMCount, index: number): string =>
  row.projectName || `unknown-project-${index}`;
