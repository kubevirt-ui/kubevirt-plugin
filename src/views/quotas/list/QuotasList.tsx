import React, { FC } from 'react';

import ErrorAlert from '@kubevirt-utils/components/ErrorAlert/ErrorAlert';
import ListPageFilter from '@kubevirt-utils/components/ListPageFilter/ListPageFilter';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useNamespaceParam from '@kubevirt-utils/hooks/useNamespaceParam';
import {
  ApplicationAwareClusterResourceQuotaModel,
  ApplicationAwareResourceQuotaModel,
  modelToGroupVersionKind,
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

import QuotasCreateButton from './components/QuotasCreateButton';
import QuotasEmptyState from './components/QuotasEmptyState';
import QuotasLearnMoreLink from './components/QuotasLearnMoreLink';
import QuotasTableRow from './components/QuotasTableRow/QuotasTableRow';
import useQuotasColumns from './hooks/useQuotasColumns';

const QuotasList: FC = () => {
  const { t } = useKubevirtTranslation();
  const namespace = useNamespaceParam();

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

  const quotas = [...namespaceQuotas, ...clusterQuotas];
  const loaded = namespaceQuotasLoaded && clusterQuotasLoaded;
  const loadError = namespaceQuotasLoadError || clusterQuotasLoadError;

  const showEmptyState = loaded && isEmpty(quotas);

  const [data, filteredData, onFilterChange] = useListPageFilter(quotas);
  const [columns, activeColumns, isColumnsLoaded] = useQuotasColumns(namespace);

  if (loadError) {
    // TODO this
    return <ErrorAlert error={loadError} />;
  }

  return (
    <>
      <ListPageHeader
        helpText={
          <>
            <div className="pf-v6-u-text-color-subtle pf-v6-u-my-sm">
              {t(
                'View and manage virtualization-specific resource quotas configured through the Application Aware Quota (AAQ) Operator.',
              )}
            </div>
            <QuotasLearnMoreLink />
          </>
        }
        title={t('Virtualization quotas')}
      >
        {!showEmptyState && <QuotasCreateButton namespace={namespace} />}
      </ListPageHeader>
      <ListPageBody>
        {showEmptyState ? (
          <QuotasEmptyState namespace={namespace} />
        ) : (
          <>
            <ListPageFilter
              columnLayout={{
                columns: columns?.map(({ additional, id, title }) => ({
                  additional,
                  id,
                  title,
                })),
                id: ApplicationAwareClusterResourceQuotaModel.kind,
                selectedColumns: new Set(activeColumns?.map((col) => col?.id)),
                type: t('Quota'),
              }}
              data={quotas}
              loaded={isColumnsLoaded}
              onFilterChange={onFilterChange}
            />
            <VirtualizedTable
              EmptyMsg={() => (
                <div className="pf-v6-u-text-align-center">
                  {t('No Application Aware Resource Quotas found')}
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
