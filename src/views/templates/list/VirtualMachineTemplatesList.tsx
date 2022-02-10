import * as React from 'react';

import { TemplateModel } from '@kubevirt-ui/kubevirt-api/console';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { useVmTemplates } from '@kubevirt-utils/resources/template';
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

const VirtualMachineTemplatesList: React.FC = () => {
  const { t } = useKubevirtTranslation();
  const { templates, loaded, loadError } = useVmTemplates();
  const [data, filteredData, onFilterChange] = useListPageFilter(
    templates,
    useVirtualMachineTemplatesFilters(),
  );

  return (
    <>
      <ListPageHeader title={t('Virtual Machine Templates')}></ListPageHeader>
      <ListPageBody>
        <ListPageFilter
          data={data}
          loaded={loaded}
          rowFilters={useVirtualMachineTemplatesFilters()}
          onFilterChange={onFilterChange}
        />
        <VirtualMachineTemplateSupport />
        <VirtualizedTable<K8sResourceCommon>
          data={filteredData}
          unfilteredData={data}
          loaded={loaded}
          loadError={loadError}
          columns={useVirtualMachineTemplatesColumns()}
          Row={VirtualMachineTemplatesRow}
          rowData={{ kind: TemplateModel.kind }}
        />
      </ListPageBody>
    </>
  );
};

export default VirtualMachineTemplatesList;
