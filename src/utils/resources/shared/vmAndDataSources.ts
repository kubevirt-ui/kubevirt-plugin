import { modelToGroupVersionKind } from '@kubevirt-ui-ext/kubevirt-api/console';
import {
  type V1beta1DataImportCron,
  type V1beta1DataSource,
} from '@kubevirt-ui-ext/kubevirt-api/containerized-data-importer';
import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { TemplateModel } from '@kubevirt-utils/models';
import { Operator } from '@openshift-console/dynamic-plugin-sdk';

import { TEMPLATE_TYPE_LABEL } from '../template';

import { isDataSourceReady } from '../../../views/datasources/utils';
import { getDataImportCronFromDataSource } from '../bootableresources/helpers';
import type {
  MultiNamespaceVirtualMachineStorageMigrationPlan,
  StorageMigrationPlanNamespaceStatus,
} from '../migrations/constants';
import {
  isDataSourceCloning,
  isDataSourceUploading,
} from '../template/hooks/useVmTemplateSource/utils';
import { getStatusConditionReason } from './conditions';

export const getVMStatus = (vm: V1VirtualMachine): string | undefined =>
  vm?.status?.printableStatus;

export const getVMSnapshottingStatus = (vm: V1VirtualMachine): string | undefined =>
  vm?.status?.snapshotInProgress;

export const getVMRestoringStatus = (vm: V1VirtualMachine): string | undefined =>
  vm?.status?.restoreInProgress;

export const getAllowedTemplateResources = (projectNames: string[]): Record<string, unknown> => {
  const TemplateModelGroupVersionKind = modelToGroupVersionKind(TemplateModel);
  return Object.fromEntries(
    (projectNames ?? []).map((projName) => [
      `${projName}/${TemplateModel.plural}`,
      {
        groupVersionKind: TemplateModelGroupVersionKind,
        isList: true,
        namespace: projName,
        selector: {
          matchExpressions: [
            {
              key: TEMPLATE_TYPE_LABEL,
              operator: Operator.Exists,
            },
          ],
        },
      },
    ]),
  );
};

export const getAvailableDataSources = (dataSources: V1beta1DataSource[]): V1beta1DataSource[] =>
  dataSources?.filter((dataSource) => isDataSourceReady(dataSource));

export const isDataImportCronProgressing = (dataImportCron: V1beta1DataImportCron): boolean =>
  getStatusConditionReason(dataImportCron, 'UpToDate') === 'ImportProgressing';

export const getReadyOrCloningOrUploadingDataSources = (
  dataSources: V1beta1DataSource[],
  dataImportCrons: V1beta1DataImportCron[],
): V1beta1DataSource[] =>
  dataSources?.filter((dataSource) => {
    const dataImportCron = getDataImportCronFromDataSource(dataImportCrons, dataSource);

    return (
      isDataSourceReady(dataSource) ||
      isDataSourceCloning(dataSource) ||
      isDataSourceUploading(dataSource) ||
      isDataImportCronProgressing(dataImportCron)
    );
  });

export const getStatusNamespaces = (
  plan: MultiNamespaceVirtualMachineStorageMigrationPlan,
): StorageMigrationPlanNamespaceStatus[] | undefined => plan?.status?.namespaces;
