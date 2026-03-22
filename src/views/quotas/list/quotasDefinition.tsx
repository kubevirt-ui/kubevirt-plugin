import React from 'react';
import { TFunction } from 'react-i18next';

import { getK8sRowId } from '@kubevirt-utils/components/KubevirtTable/utils';
import { ColumnConfig } from '@kubevirt-utils/hooks/useDataViewTableSort/types';
import { ACTIONS } from '@kubevirt-utils/hooks/useKubevirtUserSettings/utils/const';
import { ApplicationAwareQuota, CalculationMethod } from '@kubevirt-utils/resources/quotas/types';
import { getCreationTimestamp, getName, getNamespace } from '@kubevirt-utils/resources/shared';

import { getMainResourceKeys, getQuotaNumbers, getStatus } from '../utils/utils';

import QuotaActionsCell from './cells/QuotaActionsCell';
import QuotaAdditionalCell from './cells/QuotaAdditionalCell';
import QuotaCPUCell from './cells/QuotaCPUCell';
import QuotaCreatedCell from './cells/QuotaCreatedCell';
import QuotaMemoryCell from './cells/QuotaMemoryCell';
import QuotaNameCell from './cells/QuotaNameCell';
import QuotaNamespaceCell from './cells/QuotaNamespaceCell';
import QuotaVMICountCell from './cells/QuotaVMICountCell';
import { createSortByPercentage, getNamespaceColumnValue, QuotaCallbacks } from './utils/helpers';
import { QuotaColumn, QuotaScope } from './constants';

const getUsagePercentageValue = (row: ApplicationAwareQuota, resourceKey: string): string => {
  const status = getStatus(row);
  return String(
    getQuotaNumbers(status?.used?.[resourceKey], status?.hard?.[resourceKey])?.percentage ?? 0,
  );
};

export const getQuotaColumns = (
  t: TFunction,
  namespace: string,
  scope: QuotaScope,
  calculationMethod: CalculationMethod,
): ColumnConfig<ApplicationAwareQuota, QuotaCallbacks>[] => {
  const hasPodOverhead = calculationMethod === CalculationMethod.VmiPodUsage;
  const { cpu, memory, vmiCount } = getMainResourceKeys(
    calculationMethod === CalculationMethod.DedicatedVirtualResources,
  );

  const columns: ColumnConfig<ApplicationAwareQuota, QuotaCallbacks>[] = [
    {
      getValue: (row) => getName(row) ?? '',
      key: QuotaColumn.NAME,
      label: t('Name'),
      renderCell: (row) => <QuotaNameCell row={row} />,
      sortable: true,
    },
  ];

  if (scope === QuotaScope.CLUSTER) {
    columns.push({
      getValue: getNamespaceColumnValue,
      key: QuotaColumn.NAMESPACE,
      label: t('Namespaces'),
      renderCell: (row) => <QuotaNamespaceCell row={row} />,
      sortable: true,
    });
  } else if (!namespace) {
    columns.push({
      getValue: (row) => getNamespace(row) ?? '',
      key: QuotaColumn.NAMESPACE,
      label: t('Namespace'),
      renderCell: (row) => <QuotaNamespaceCell row={row} />,
      sortable: true,
    });
  }

  columns.push(
    {
      getValue: (row) => getUsagePercentageValue(row, cpu),
      key: QuotaColumn.CPU,
      label: hasPodOverhead ? t('CPU allocated') : t('vCPU allocated'),
      renderCell: (row, callbacks) => <QuotaCPUCell callbacks={callbacks} row={row} />,
      sort: createSortByPercentage(cpu),
      sortable: true,
    },
    {
      getValue: (row) => getUsagePercentageValue(row, memory),
      key: QuotaColumn.MEMORY,
      label: hasPodOverhead ? t('Memory allocated') : t('Virtual memory allocated'),
      renderCell: (row, callbacks) => <QuotaMemoryCell callbacks={callbacks} row={row} />,
      sort: createSortByPercentage(memory),
      sortable: true,
    },
    {
      getValue: (row) => getUsagePercentageValue(row, vmiCount),
      key: QuotaColumn.VMI_COUNT,
      label: t('VMI limits'),
      renderCell: (row, callbacks) => <QuotaVMICountCell callbacks={callbacks} row={row} />,
      sort: createSortByPercentage(vmiCount),
      sortable: true,
    },
    {
      getValue: () => '',
      key: QuotaColumn.ADDITIONAL,
      label: t('Additional quota'),
      renderCell: (row) => <QuotaAdditionalCell row={row} />,
    },
    {
      getValue: (row) => getCreationTimestamp(row) ?? '',
      key: QuotaColumn.CREATION_TIME,
      label: t('Created'),
      renderCell: (row) => <QuotaCreatedCell row={row} />,
      sortable: true,
    },
    {
      key: ACTIONS,
      label: '',
      props: { className: 'pf-v6-c-table__action' },
      renderCell: (row) => <QuotaActionsCell row={row} />,
    },
  );

  return columns;
};

export const getQuotaRowId = (quota: ApplicationAwareQuota, index: number): string =>
  getK8sRowId(quota, index, 'quota');
