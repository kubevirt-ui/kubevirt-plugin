import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';

import { useAvailableSourceTemplates } from '@catalog/templatescatalog/hooks/useAvailableSourceTemplates';
import {
  modelToGroupVersionKind,
  TemplateModel,
  V1Template,
} from '@kubevirt-ui/kubevirt-api/console';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  TEMPLATE_TYPE_BASE,
  TEMPLATE_TYPE_LABEL,
  TEMPLATE_TYPE_VM,
} from '@kubevirt-utils/resources/template';
import {
  K8sResourceCommon,
  ListPageBody,
  ListPageFilter,
  ListPageHeader,
  Operator,
  useK8sWatchResource,
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
  const [templates, loaded, error] = useK8sWatchResource<V1Template[]>({
    groupVersionKind: modelToGroupVersionKind(TemplateModel),
    namespace,
    selector: {
      matchExpressions: [
        {
          operator: Operator.In,
          key: TEMPLATE_TYPE_LABEL,
          values: [TEMPLATE_TYPE_BASE, TEMPLATE_TYPE_VM],
        },
      ],
    },
    isList: true,
  });

  const { availableTemplatesUID } = useAvailableSourceTemplates({
    namespace: namespace,
    onlyAvailable: false,
    onlyDefault: false,
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
