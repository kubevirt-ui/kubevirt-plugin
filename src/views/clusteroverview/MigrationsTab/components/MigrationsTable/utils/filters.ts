import { TFunction } from 'i18next';

import { V1VirtualMachineInstance } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { KubevirtFilter } from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/types';
import { vmimStatuses } from '@kubevirt-utils/resources/vmim/statuses';

import {
  getMigrationSourceNode,
  getMigrationTargetNode,
} from '@kubevirt-utils/resources/vmi/utils/selectors';
import { getMigrationPhase } from '@kubevirt-utils/resources/vmim/selectors';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import {
  MIGRATION_SOURCE_FILTER_ID,
  MIGRATION_STATUS_FILTER_ID,
  MIGRATION_TARGET_FILTER_ID,
} from './constants';
import { MigrationTableDataLayout } from './utils';

export const getStatusFilter = (t: TFunction): KubevirtFilter<MigrationTableDataLayout>[] => [
  {
    categoryLabel: t('Status'),
    id: MIGRATION_STATUS_FILTER_ID,
    match: (obj, selected) => selected.includes(getMigrationPhase(obj?.vmim)),
    options: Object.keys(vmimStatuses).map((status) => ({
      label: status,
      value: status,
    })),
  },
];

export const getSourceNodeFilter = (
  t: TFunction,
  vmis: V1VirtualMachineInstance[],
): KubevirtFilter<MigrationTableDataLayout>[] => {
  if (isEmpty(vmis) || vmis.every((vmi) => !getMigrationSourceNode(vmi))) {
    return [];
  }

  const nodes = new Set((vmis || []).map((vmi) => getMigrationSourceNode(vmi))?.filter(Boolean));

  return [
    {
      categoryLabel: t('Source Node'),
      id: MIGRATION_SOURCE_FILTER_ID,
      match: (obj, selected) => {
        const nodeName = getMigrationSourceNode(obj?.vmiObj);
        return selected.includes(`source-${nodeName}`);
      },
      options: Array.from(nodes).map((nodeName) => ({
        label: nodeName,
        value: `source-${nodeName}`,
      })),
    },
  ];
};

export const getTargetNodeFilter = (
  t: TFunction,
  vmis: V1VirtualMachineInstance[],
): KubevirtFilter<MigrationTableDataLayout>[] => {
  if (isEmpty(vmis) || vmis.every((vmi) => !getMigrationTargetNode(vmi))) {
    return [];
  }

  const nodes = new Set((vmis || []).map((vmi) => getMigrationTargetNode(vmi))?.filter(Boolean));

  return [
    {
      categoryLabel: t('Target Node'),
      id: MIGRATION_TARGET_FILTER_ID,
      match: (obj, selected) => {
        const nodeName = getMigrationTargetNode(obj?.vmiObj);
        return selected.includes(`target-${nodeName}`);
      },
      options: Array.from(nodes).map((nodeName) => ({
        label: nodeName,
        value: `target-${nodeName}`,
      })),
    },
  ];
};
