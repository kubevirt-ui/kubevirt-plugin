import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';

import { useAvailableSourceTemplates } from '@catalog/templatescatalog/hooks/useAvailableSourceTemplates';
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
  const { templates, loaded, error, availableTemplatesUID } = useAvailableSourceTemplates({
    onlyAvailable: false,
    onlyDefault: false,
    namespace,
  });
  const filters = useVirtualMachineTemplatesFilters(availableTemplatesUID);
  const [data, filteredData, onFilterChange] = useListPageFilter(templates, filters);

  return (
    <>
      <ListPageHeader title={t('Virtual Machine Templates')}></ListPageHeader>
      <ListPageBody>
        <ListPageFilter
          data={data}
          loaded={loaded}
          rowFilters={filters}
          onFilterChange={onFilterChange}
        />
        <VirtualMachineTemplateSupport />
        <VirtualizedTable<K8sResourceCommon, { kind: string; availableTemplatesUID: Set<string> }>
          data={filteredData}
          unfilteredData={data}
          loaded={loaded}
          loadError={error}
          columns={useVirtualMachineTemplatesColumns()}
          Row={VirtualMachineTemplatesRow}
          rowData={{ kind: TemplateModel.kind, availableTemplatesUID }}
        />
      </ListPageBody>
    </>
  );
};

export default VirtualMachineTemplatesList;
