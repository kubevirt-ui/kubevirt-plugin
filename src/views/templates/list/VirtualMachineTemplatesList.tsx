import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';

import { modelToRef, TemplateModel } from '@kubevirt-ui/kubevirt-api/console';
import { V1beta1DataSource } from '@kubevirt-ui/kubevirt-api/containerized-data-importer/models';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  K8sResourceCommon,
  ListPageBody,
  ListPageCreate,
  ListPageFilter,
  ListPageHeader,
  useListPageFilter,
  VirtualizedTable,
} from '@openshift-console/dynamic-plugin-sdk';
import { Stack, StackItem } from '@patternfly/react-core';

import VirtualMachineTemplatesRow from './components/VirtualMachineTemplatesRow';
import VirtualMachineTemplateSupport from './components/VirtualMachineTemplateSupport';
import { useTemplatesWithAvailableSource } from './hooks/useTemplatesWithAvailableSource';
import useVirtualMachineTemplatesColumns from './hooks/useVirtualMachineTemplatesColumns';
import useVirtualMachineTemplatesFilters from './hooks/useVirtualMachineTemplatesFilters';

const VirtualMachineTemplatesList: React.FC<RouteComponentProps<{ ns: string }>> = ({
  match: {
    params: { ns: namespace },
  },
}) => {
  const { t } = useKubevirtTranslation();
  const {
    templates,
    loaded,
    error,
    availableTemplatesUID,
    availableDatasources,
    cloneInProgressDatasources,
    bootSourcesLoaded,
  } = useTemplatesWithAvailableSource({
    namespace,
    onlyAvailable: false,
    onlyDefault: false,
  });
  const filters = useVirtualMachineTemplatesFilters(availableTemplatesUID);
  const [data, filteredData, onFilterChange] = useListPageFilter(templates, filters);
  const [columns, activeColumns] = useVirtualMachineTemplatesColumns(namespace);

  const templatesLoaded = loaded && bootSourcesLoaded;

  return (
    <>
      <ListPageHeader title={t('VirtualMachine Templates')}>
        <ListPageCreate
          createAccessReview={{ groupVersionKind: modelToRef(TemplateModel), namespace }}
          groupVersionKind={modelToRef(TemplateModel)}
        >
          {t('Create Template')}
        </ListPageCreate>
      </ListPageHeader>
      <ListPageBody>
        <Stack hasGutter>
          <StackItem>
            <VirtualMachineTemplateSupport />
          </StackItem>
          <StackItem>
            <ListPageFilter
              data={data}
              loaded={templatesLoaded}
              rowFilters={filters}
              onFilterChange={onFilterChange}
              columnLayout={{
                columns: columns?.map(({ id, title, additional }) => ({
                  id,
                  title,
                  additional,
                })),
                id: modelToRef(TemplateModel),
                selectedColumns: new Set(activeColumns?.map((col) => col?.id)),
                type: t('Template'),
              }}
            />
            <VirtualizedTable<
              K8sResourceCommon,
              {
                availableTemplatesUID: Set<string>;
                availableDatasources: Record<string, V1beta1DataSource>;
                cloneInProgressDatasources: Record<string, V1beta1DataSource>;
              }
            >
              data={filteredData}
              unfilteredData={data}
              loaded={templatesLoaded}
              loadError={error}
              columns={activeColumns}
              Row={VirtualMachineTemplatesRow}
              rowData={{ availableTemplatesUID, availableDatasources, cloneInProgressDatasources }}
            />
          </StackItem>
        </Stack>
      </ListPageBody>
    </>
  );
};

export default VirtualMachineTemplatesList;
