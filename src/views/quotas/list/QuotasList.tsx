import React, { FCC, useMemo } from 'react';

import KubevirtTable from '@kubevirt-utils/components/KubevirtTable/KubevirtTable';
import { buildColumnLayout } from '@kubevirt-utils/components/KubevirtTable/utils';
import ListPageFilter from '@kubevirt-utils/components/ListPageFilter/ListPageFilter';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useKubevirtTableColumns from '@kubevirt-utils/hooks/useKubevirtUserSettings/useKubevirtTableColumns';
import useNamespaceParam from '@kubevirt-utils/hooks/useNamespaceParam';
import usePaginationWithFilters from '@kubevirt-utils/hooks/usePagination/usePaginationWithFilters';
import { paginationDefaultValues } from '@kubevirt-utils/hooks/usePagination/utils/constants';
import {
  ApplicationAwareClusterResourceQuotaModel,
  ApplicationAwareResourceQuotaModel,
  modelToGroupVersionKind,
  modelToRef,
} from '@kubevirt-utils/models';
import { ApplicationAwareQuota } from '@kubevirt-utils/resources/quotas/types';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import {
  K8sResourceKind,
  ListPageBody,
  ListPageHeader,
  useK8sWatchResource,
  useListPageFilter,
} from '@openshift-console/dynamic-plugin-sdk';
import { Pagination, Tab, Tabs, TabTitleText } from '@patternfly/react-core';

import useAAQCalculationMethod from '../hooks/useAAQCalculationMethod';

import QuotasCreateButton from './components/QuotasCreateButton';
import QuotasEmptyState from './components/QuotasEmptyState';
import QuotasLearnMoreLink from './components/QuotasLearnMoreLink';
import useQuotasListTab from './hooks/useQuotasListTab';
import { QuotaCallbacks } from './utils/helpers';
import { QuotaScope } from './constants';
import { getQuotaColumns, getQuotaRowId } from './quotasDefinition';

import '@kubevirt-utils/styles/list-managment-group.scss';

const QuotasList: FCC = () => {
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
  });

  const [clusterQuotas, clusterQuotasLoaded, clusterQuotasLoadError] = useK8sWatchResource<
    K8sResourceKind[]
  >({
    groupVersionKind: modelToGroupVersionKind(ApplicationAwareClusterResourceQuotaModel),
    isList: true,
  });

  const hasClusterQuotas = clusterQuotasLoaded && !isEmpty(clusterQuotas);
  const showTabs = hasClusterQuotas || activeTab === QuotaScope.CLUSTER;

  const quotas = useMemo(
    () =>
      (activeTab === QuotaScope.CLUSTER
        ? clusterQuotas
        : namespaceQuotas) as ApplicationAwareQuota[],
    [activeTab, clusterQuotas, namespaceQuotas],
  );
  const loaded = activeTab === QuotaScope.CLUSTER ? clusterQuotasLoaded : namespaceQuotasLoaded;
  const loadError =
    activeTab === QuotaScope.CLUSTER ? clusterQuotasLoadError : namespaceQuotasLoadError;

  const showEmptyState = loaded && !loadError && isEmpty(quotas);

  const [unfilteredData, filteredData, onFilterChange] = useListPageFilter(quotas);

  const { handleFilterChange, handlePerPageSelect, handleSetPage, pagination } =
    usePaginationWithFilters(filteredData?.length ?? 0, onFilterChange);

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
      <ListPageHeader
        helpText={
          <>
            <div className="pf-v6-u-text-color-subtle pf-v6-u-my-sm">
              {t(
                'Define and monitor quotas for virtual machines and pods using Application Aware Quota. AAQ provides more accurate quota enforcement for virtualized workloads and is designed to fully replace Kubernetes ResourceQuota.',
              )}
            </div>
            <div>
              <QuotasLearnMoreLink />
            </div>
          </>
        }
        title={t('Application-aware quotas')}
      >
        {!showEmptyState && <QuotasCreateButton namespace={namespace} />}
      </ListPageHeader>
      {showTabs && (
        <Tabs activeKey={activeTab} onSelect={handleTabSelect} usePageInsets>
          <Tab
            eventKey={QuotaScope.PROJECT}
            title={<TabTitleText>{t('Project-scoped')}</TabTitleText>}
          />
          <Tab
            eventKey={QuotaScope.CLUSTER}
            title={<TabTitleText>{t('Cluster-scoped')}</TabTitleText>}
          />
        </Tabs>
      )}
      <ListPageBody>
        {showEmptyState ? (
          <QuotasEmptyState namespace={namespace} />
        ) : (
          <>
            <div className="list-managment-group">
              <ListPageFilter
                columnLayout={columnLayout}
                data={unfilteredData}
                loaded={isLoaded}
                onFilterChange={handleFilterChange}
              />
              {!isEmpty(filteredData) && isLoaded && (
                <Pagination
                  className="list-managment-group__pagination"
                  isLastFullPageShown
                  itemCount={filteredData?.length}
                  onPerPageSelect={handlePerPageSelect}
                  onSetPage={handleSetPage}
                  page={pagination?.page}
                  perPage={pagination?.perPage}
                  perPageOptions={paginationDefaultValues}
                />
              )}
            </div>
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
              noDataMsg={t('No application-aware quotas found')}
              noFilteredDataMsg={t('No application-aware quotas found')}
              pagination={pagination}
              unfilteredData={unfilteredData}
            />
          </>
        )}
      </ListPageBody>
    </>
  );
};

export default QuotasList;
