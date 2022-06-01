import * as React from 'react';
import { RouteComponentProps, useHistory } from 'react-router-dom';

import { modelToRef, TemplateModel } from '@kubevirt-ui/kubevirt-api/console';
import { V1beta1DataSource } from '@kubevirt-ui/kubevirt-api/containerized-data-importer/models';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  K8sResourceCommon,
  ListPageBody,
  ListPageCreateButton,
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
  const history = useHistory();
  const {
    templates,
    loaded,
    error,
    availableTemplatesUID,
    availableDatasources,
    bootSourcesLoaded,
  } = useTemplatesWithAvailableSource({
    namespace,
    onlyAvailable: false,
    onlyDefault: false,
  });
  const filters = useVirtualMachineTemplatesFilters(availableTemplatesUID);
  const [data, filteredData, onFilterChange] = useListPageFilter(templates, filters);

  const templatesLoaded = loaded && bootSourcesLoaded;

  const onCreate = () => history.push(`/k8s/cluster/${modelToRef(TemplateModel)}/~new`);

  return (
    <>
      <ListPageHeader title={t('VirtualMachine Templates')}>
        <ListPageCreateButton onClick={onCreate}>{t('Create Template')}</ListPageCreateButton>
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
            />
            <VirtualizedTable<
              K8sResourceCommon,
              {
                availableTemplatesUID: Set<string>;
                availableDatasources: Record<string, V1beta1DataSource>;
              }
            >
              data={filteredData}
              unfilteredData={data}
              loaded={templatesLoaded}
              loadError={error}
              columns={useVirtualMachineTemplatesColumns()}
              Row={VirtualMachineTemplatesRow}
              rowData={{ availableTemplatesUID, availableDatasources }}
            />
          </StackItem>
        </Stack>
      </ListPageBody>
    </>
  );
};

export default VirtualMachineTemplatesList;
