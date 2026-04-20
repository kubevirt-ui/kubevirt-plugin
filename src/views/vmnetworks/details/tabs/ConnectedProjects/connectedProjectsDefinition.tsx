import React, { ReactNode } from 'react';
import { TFunction } from 'i18next';

import { ColumnConfig } from '@kubevirt-utils/hooks/useDataViewTableSort/types';

import { ProjectWithVMCount } from '../../types';

import ProjectNameCell from './cells/ProjectNameCell';
import ProjectVMCountCell from './cells/ProjectVMCountCell';

export const getConnectedProjectsColumns = (t: TFunction): ColumnConfig<ProjectWithVMCount>[] => [
  {
    getValue: (row) => row.projectName ?? '',
    key: 'name',
    label: t('Name'),
    renderCell: (row): ReactNode => <ProjectNameCell row={row} />,
    sortable: true,
  },
  {
    getValue: (row) => row.vmCount,
    key: 'connected-vms',
    label: t('Connected virtual machines'),
    renderCell: (row): ReactNode => <ProjectVMCountCell row={row} />,
    sortable: true,
  },
];

export const getConnectedProjectRowId = (row: ProjectWithVMCount, index: number): string =>
  row.projectName || `unknown-project-${index}`;
