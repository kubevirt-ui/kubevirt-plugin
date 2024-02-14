import { modelToRef, TemplateModel } from '@kubevirt-ui/kubevirt-api/console';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useKubevirtUserSettingsTableColumns from '@kubevirt-utils/hooks/useKubevirtUserSettings/useKubevirtUserSettingsTableColumns';
import { K8sResourceCommon, TableColumn } from '@openshift-console/dynamic-plugin-sdk';
import { sortable } from '@patternfly/react-table';

const useVirtualMachineTemplatesColumns = (
  namespace: string,
): [TableColumn<K8sResourceCommon>[], TableColumn<K8sResourceCommon>[], boolean] => {
  const { t } = useKubevirtTranslation();

  const columns = [
    {
      id: 'name',
      props: { className: 'pf-m-width-30' },
      sort: 'metadata.name',
      title: t('Name'),
      transforms: [sortable],
    },
    ...(!namespace
      ? [
          {
            id: 'namespace',
            sort: 'metadata.namespace',
            title: t('Namespace'),
            transforms: [sortable],
          },
        ]
      : []),
    {
      id: 'workload',
      props: { className: 'pf-m-width-15' },
      sort: 'objects[0].spec.template.metadata.annotations.["vm.kubevirt.io/workload"]',
      title: t('Workload profile'),
      transforms: [sortable],
    },
    {
      id: 'availability',
      props: { className: 'pf-m-width-30' },
      title: t('Boot source'),
    },
    {
      additional: true,
      id: 'cpu',
      title: t('CPU | Memory'),
    },
    {
      id: '',
      props: { className: 'dropdown-kebab-pf pf-v5-c-table__action' },
      title: '',
    },
  ];

  const [activeColumns, , loadedColumns] = useKubevirtUserSettingsTableColumns<K8sResourceCommon>({
    columnManagementID: modelToRef(TemplateModel),
    columns,
  });

  return [columns, activeColumns, loadedColumns];
};

export default useVirtualMachineTemplatesColumns;
