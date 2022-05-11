import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';

import { useTemplatesWithAvailableSource } from '@catalog/templatescatalog/hooks/useTemplatesWithAvailableSource';
import { TemplateModel } from '@kubevirt-ui/kubevirt-api/console';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  K8sResourceCommon,
  ListPageBody,
  ListPageFilter,
  ListPageHeader,
  useListPageFilter,
  VirtualizedTable,
} from '@openshift-console/dynamic-plugin-sdk';
import { Stack, StackItem } from '@patternfly/react-core';

import VirtualMachineTemplatesRow from './components/VirtualMachineTemplatesRow';
import VirtualMachineTemplateSupport from './components/VirtualMachineTemplateSupport';
import useVirtualMachineTemplatesColumns from './hooks/useVirtualMachineTemplatesColumns';
import useVirtualMachineTemplatesFilters from './hooks/useVirtualMachineTemplatesFilters';

const VirtualMachineTemplatesList: React.FC<RouteComponentProps<{ ns: string }>> = ({
  match: {
    params: { ns: namespace },
  },
}) => {
  const { t } = useKubevirtTranslation();
  const { templates, availableTemplatesUID, loaded, bootSourcesLoaded, error } =
    useTemplatesWithAvailableSource({
      namespace,
      onlyAvailable: false,
      onlyDefault: false,
    });
  const filters = useVirtualMachineTemplatesFilters(availableTemplatesUID);
  const [data, filteredData, onFilterChange] = useListPageFilter(templates, filters);

  const templatesLoaded = loaded && bootSourcesLoaded;

  return (
    <>
      <ListPageHeader title={t('Virtual Machine Templates')}></ListPageHeader>
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
              { kind: string; availableTemplatesUID: Set<string> }
            >
              data={filteredData}
              unfilteredData={data}
              loaded={templatesLoaded}
              loadError={error}
              columns={useVirtualMachineTemplatesColumns()}
              Row={VirtualMachineTemplatesRow}
              rowData={{ kind: TemplateModel.kind, availableTemplatesUID }}
            />
          </StackItem>
        </Stack>
      </ListPageBody>
    </>
  );
};

export default VirtualMachineTemplatesList;
