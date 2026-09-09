import React, { type FC, useMemo } from 'react';

import KubevirtTable from '@kubevirt-utils/components/KubevirtTable/KubevirtTable';
import { buildColumnLayout } from '@kubevirt-utils/components/KubevirtTable/utils';
import useKubevirtDataViewFilters from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/useKubevirtDataViewFilters';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useKubevirtTableColumns from '@kubevirt-utils/hooks/useKubevirtUserSettings/useKubevirtTableColumns';
import useNamespaceParam from '@kubevirt-utils/hooks/useNamespaceParam';
import usePaginationWithFilters from '@kubevirt-utils/hooks/usePagination/usePaginationWithFilters';
import {
  ApplicationAwareClusterResourceQuotaModel,
  ApplicationAwareResourceQuotaModel,
  modelToGroupVersionKind,
  modelToRef,
} from '@kubevirt-utils/models';
import { type ApplicationAwareQuota } from '@kubevirt-utils/resources/quotas/types';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import {
  type K8sResourceKind,
  ListPageBody,
  useK8sWatchResource,
} from '@openshift-console/dynamic-plugin-sdk';

import useAAQCalculationMethod from '../hooks/useAAQCalculationMethod';
import QuotasEmptyState from './components/QuotasEmptyState';
import QuotasListHeader from './components/QuotasListHeader';
import QuotasListToolbar from './components/QuotasListToolbar';
import { QuotaScope } from './constants';
import useQuotasListTab from './hooks/useQuotasListTab';
import { getQuotaColumns, getQuotaRowId } from './quotasDefinition';
import { type QuotaCallbacks } from './utils/helpers';

import '@kubevirt-utils/styles/list-managment-group.scss';

const QuotasList: FC = () => {
  const { t } = useKubevirtTranslation();
  const namespace = useNamespaceParam();
  const { activeTab, handleTabSelect } = useQuotasListTab();
  const calculationMethod = useAAQCalculationMethod();

  const [namespaceQuotas, namespaceQuotasLoaded, namespaceQuotasLoadError] = useK8sWatchResource<
    K8sResourceKind[]
  >({
    groupVersionKind: modelToGroupVersionKind(ApplicationAwareResourceQuotaModel),
    isList: true,
    namespace,
  }) as [K8sResourceKind[], boolean, unknown];

  const [clusterQuotas, clusterQuotasLoaded, clusterQuotasLoadError] = useK8sWatchResource<
    K8sResourceKind[]
  >({
    groupVersionKind: modelToGroupVersionKind(ApplicationAwareClusterResourceQuotaModel),
    isList: true,
  }) as [K8sResourceKind[], boolean, unknown];

  const hasClusterQuotas = clusterQuotasLoaded && !isEmpty(clusterQuotas);
  const showTabs = hasClusterQuotas || activeTab === QuotaScope.CLUSTER;

  const quotas = useMemo(
    (): ApplicationAwareQuota[] =>
      (activeTab === QuotaScope.CLUSTER
        ? clusterQuotas
        : namespaceQuotas) as ApplicationAwareQuota[],
    [activeTab, clusterQuotas, namespaceQuotas],
  );
  const loaded = activeTab === QuotaScope.CLUSTER ? clusterQuotasLoaded : namespaceQuotasLoaded;
  const loadError =
    activeTab === QuotaScope.CLUSTER ? clusterQuotasLoadError : namespaceQuotasLoadError;

  const showEmptyState = loaded && !loadError && isEmpty(quotas);

  const { clearAllFilters, filteredData, filters, onSetFilters } = useKubevirtDataViewFilters({
    data: quotas ?? [],
  });

  const {
    handleFilterChange: handleSetFilters,
    handlePerPageSelect,
    handleSetPage,
    pagination,
  } = usePaginationWithFilters(filteredData?.length ?? 0, onSetFilters);

  const columns = useMemo(
    () => getQuotaColumns(t, namespace, activeTab, calculationMethod),
    [t, namespace, activeTab, calculationMethod],
  );

  const { activeColumnKeys, loaded: loadedColumns } = useKubevirtTableColumns({
    columnManagementID: modelToRef(ApplicationAwareResourceQuotaModel),
    columns,
  });

  const columnLayout = useMemo(
    () =>
      buildColumnLayout(
        columns,
        activeColumnKeys,
        modelToRef(ApplicationAwareResourceQuotaModel),
        t('Quota'),
      ),
    [columns, activeColumnKeys, t],
  );

  const callbacks: QuotaCallbacks = useMemo(
    () => ({
      calculationMethod,
    }),
    [calculationMethod],
  );

  const isLoaded = loaded && loadedColumns;

  return (
    <>
      <QuotasListHeader
        activeTab={activeTab}
        handleTabSelect={handleTabSelect}
        namespace={namespace}
        showEmptyState={showEmptyState}
        showTabs={showTabs}
      />
      <ListPageBody>
        {showEmptyState ? (
          <QuotasEmptyState namespace={namespace} />
        ) : (
          <>
            <QuotasListToolbar
              activeColumnKeys={activeColumnKeys}
              callbacks={callbacks}
              clearAllFilters={clearAllFilters}
              columnLayout={columnLayout}
              columns={columns}
              filteredData={filteredData ?? []}
              filters={filters}
              handlePerPageSelect={handlePerPageSelect}
              handleSetFilters={handleSetFilters}
              handleSetPage={handleSetPage}
              isLoaded={isLoaded}
              pagination={pagination}
              quotas={quotas}
            />
            <KubevirtTable<ApplicationAwareQuota, QuotaCallbacks>
              activeColumnKeys={activeColumnKeys}
              ariaLabel={t('Application-aware quotas table')}
              callbacks={callbacks}
              columns={columns}
              data={filteredData ?? []}
              dataTest="quotas-list"
              getRowId={getQuotaRowId}
              loaded={isLoaded}
              loadError={loadError}
              noDataMsg={t("You don't have any application-aware quotas yet")}
              noFilteredDataMsg={t('No application-aware quotas found')}
              pagination={pagination}
              persistSortInUrl
              unfilteredData={quotas}
            />
          </>
        )}
      </ListPageBody>
    </>
  );
};

export default QuotasList;
