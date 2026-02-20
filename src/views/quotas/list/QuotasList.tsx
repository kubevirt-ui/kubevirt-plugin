import React, { FC, useMemo } from 'react';

import ErrorAlert from '@kubevirt-utils/components/ErrorAlert/ErrorAlert';
import ListPageFilter from '@kubevirt-utils/components/ListPageFilter/ListPageFilter';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useNamespaceParam from '@kubevirt-utils/hooks/useNamespaceParam';
import usePagination from '@kubevirt-utils/hooks/usePagination/usePagination';
import { paginationDefaultValues } from '@kubevirt-utils/hooks/usePagination/utils/constants';
import {
  ApplicationAwareClusterResourceQuotaModel,
  ApplicationAwareResourceQuotaModel,
  modelToGroupVersionKind,
  modelToRef,
} from '@kubevirt-utils/models';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import {
  K8sResourceKind,
  ListPageBody,
  ListPageHeader,
  useK8sWatchResource,
  useListPageFilter,
  VirtualizedTable,
} from '@openshift-console/dynamic-plugin-sdk';
import { Pagination, Tab, Tabs, TabTitleText } from '@patternfly/react-core';

import QuotasCreateButton from './components/QuotasCreateButton';
import QuotasEmptyState from './components/QuotasEmptyState';
import QuotasLearnMoreLink from './components/QuotasLearnMoreLink';
import QuotasTableRow from './components/QuotasTableRow';
import useQuotasColumns from './hooks/useQuotasColumns';
import useQuotasListTab from './hooks/useQuotasListTab';
import { QuotaScope } from './constants';

import '@kubevirt-utils/styles/list-managment-group.scss';

const QuotasList: FC = () => {
  const { t } = useKubevirtTranslation();
  const namespace = useNamespaceParam();
  const { activeTab, handleTabSelect } = useQuotasListTab();

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

  const showTabs = clusterQuotasLoaded && !isEmpty(clusterQuotas);

  const quotas = useMemo(
    () => (activeTab === QuotaScope.CLUSTER ? clusterQuotas : namespaceQuotas),
    [activeTab, clusterQuotas, namespaceQuotas],
  );
  const loaded = activeTab === QuotaScope.CLUSTER ? clusterQuotasLoaded : namespaceQuotasLoaded;
  const loadError =
    activeTab === QuotaScope.CLUSTER ? clusterQuotasLoadError : namespaceQuotasLoadError;

  const showEmptyState = loaded && isEmpty(quotas);

  const { onPaginationChange, pagination } = usePagination();
  const [data, filteredData, onFilterChange] = useListPageFilter(quotas);
  const [columns, activeColumns, isColumnsLoaded] = useQuotasColumns(namespace, activeTab);

  if (loadError) {
    return <ErrorAlert error={loadError} />;
  }

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
                columnLayout={{
                  columns: columns?.map(({ additional, id, title }) => ({
                    additional,
                    id,
                    title,
                  })),
                  id: modelToRef(ApplicationAwareResourceQuotaModel),
                  selectedColumns: new Set(activeColumns?.map((col) => col?.id)),
                  type: t('Quota'),
                }}
                onFilterChange={(...args) => {
                  onFilterChange(...args);
                  onPaginationChange({
                    endIndex: pagination?.perPage,
                    page: 1,
                    perPage: pagination?.perPage,
                    startIndex: 0,
                  });
                }}
                data={quotas}
                loaded={isColumnsLoaded}
              />
              {!isEmpty(filteredData) && (
                <Pagination
                  onPerPageSelect={(_e, perPage, page, startIndex, endIndex) =>
                    onPaginationChange({ endIndex, page, perPage, startIndex })
                  }
                  onSetPage={(_e, page, perPage, startIndex, endIndex) =>
                    onPaginationChange({ endIndex, page, perPage, startIndex })
                  }
                  className="list-managment-group__pagination"
                  isLastFullPageShown
                  itemCount={filteredData?.length}
                  page={pagination?.page}
                  perPage={pagination?.perPage}
                  perPageOptions={paginationDefaultValues}
                />
              )}
            </div>
            <VirtualizedTable
              EmptyMsg={() => (
                <div className="pf-v6-u-text-align-center">
                  {t('No application-aware quotas found')}
                </div>
              )}
              columns={activeColumns}
              data={filteredData}
              loaded={loaded && isColumnsLoaded}
              loadError={loadError}
              Row={QuotasTableRow}
              unfilteredData={data}
            />
          </>
        )}
      </ListPageBody>
    </>
  );
};

export default QuotasList;
