import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { K8sResourceCommon, TableColumn } from '@openshift-console/dynamic-plugin-sdk';
import { sortable } from '@patternfly/react-table';

const useVirtualMachineTemplatesColumns = (): TableColumn<K8sResourceCommon>[] => {
  const { t } = useKubevirtTranslation();

  return [
    {
      title: t('Name'),
      id: 'name',
      transforms: [sortable],
      sort: 'metadata.name',
    },
    {
      title: t('Namespace'),
      id: 'namespace',
      transforms: [sortable],
      sort: 'metadata.namespace',
    },
    {
      title: t('Workload profile'),
      id: 'workload',
      transforms: [sortable],
      sort: 'objects[0].spec.template.metadata.annotations.["vm.kubevirt.io/workload"]',
    },
    {
      title: t('Boot source'),
      id: 'availability',
    },
    {
      title: t('CPU | Memory'),
      id: 'cpu',
    },
    {
      title: t(''),
      id: 'actions',
      props: { className: 'dropdown-kebab-pf pf-c-table__action' },
    },
  ];
};

export default useVirtualMachineTemplatesColumns;
