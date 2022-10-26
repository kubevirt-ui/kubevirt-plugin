import { useCallback, useMemo } from 'react';

import {
  V1VirtualMachine,
  V1VirtualMachineInstance,
  V1VirtualMachineInstanceMigration,
} from '@kubevirt-ui/kubevirt-api/kubevirt';
import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getAnnotation } from '@kubevirt-utils/resources/shared';
import {
  ANNOTATIONS,
  LABEL_USED_TEMPLATE_NAME,
  OS_NAME_LABELS,
} from '@kubevirt-utils/resources/template';
import {
  getOperatingSystem,
  getOperatingSystemName,
} from '@kubevirt-utils/resources/vm/utils/operation-system/operationSystem';
import { RowFilter } from '@openshift-console/dynamic-plugin-sdk';

import { isErrorPrintableStatus, printableVMStatus } from './virtualMachineStatuses';

type VmiMapper = {
  mapper: { [key: string]: { [key: string]: V1VirtualMachineInstance } };
  nodeNames: { [key: string]: { id: string; title: string } };
};

type VmimMapper = { [key: string]: { [key: string]: V1VirtualMachineInstance } };

const ErrorStatus = { id: 'Error', title: 'Error' };

const statusFilterItems = [
  ...Object.keys(printableVMStatus).map((status) => ({
    id: status,
    title: status,
  })),
  ErrorStatus,
];

const useStatusFilter = (): RowFilter => ({
  filterGroupName: t('Status'),
  type: 'status',
  isMatch: (obj, filterStatus) => {
    return (
      filterStatus === obj?.status?.printableStatus ||
      (filterStatus === ErrorStatus.id && isErrorPrintableStatus(obj?.status?.printableStatus))
    );
  },
  filter: (statuses, obj) => {
    const status = obj?.status?.printableStatus;
    const isError = statuses.selected.includes(ErrorStatus.id) && isErrorPrintableStatus(status);

    return statuses.selected?.length === 0 || statuses.selected?.includes(status) || isError;
  },
  items: statusFilterItems,
});

const useTemplatesFilter = (vms: V1VirtualMachine[]): RowFilter => {
  const noTemplate = t('None');
  const templates = useMemo(
    () =>
      [
        ...new Set(
          (vms || []).map((vm) => {
            const templateName = vm.metadata?.labels?.[LABEL_USED_TEMPLATE_NAME];
            return templateName ?? noTemplate;
          }),
        ),
      ].map((template) => ({ id: template, title: template })),
    [vms, noTemplate],
  );

  return {
    filterGroupName: t('Template'),
    type: 'template',
    reducer: (obj) => obj?.metadata?.labels?.[LABEL_USED_TEMPLATE_NAME] ?? noTemplate,
    filter: (selectedTemplates, obj) => {
      const templateName = obj?.metadata?.labels?.[LABEL_USED_TEMPLATE_NAME] ?? noTemplate;
      return (
        selectedTemplates.selected?.length === 0 ||
        selectedTemplates.selected?.includes(templateName)
      );
    },
    items: templates,
  };
};

const useOSFilter = (): RowFilter => {
  const getOSName = useCallback((obj) => {
    const osAnnotation = getAnnotation(obj?.spec?.template, ANNOTATIONS.os);
    const osLabel = getOperatingSystemName(obj) || getOperatingSystem(obj);
    const osName = Object.values(OS_NAME_LABELS).find(
      (osKey) =>
        osAnnotation?.toLowerCase()?.startsWith(osKey?.toLowerCase()) ||
        osLabel?.toLowerCase()?.startsWith(osKey?.toLowerCase()),
    );
    return osName;
  }, []);
  return {
    filterGroupName: t('Operating system'),
    type: 'os',
    reducer: getOSName,
    filter: (selectedOS, obj) => {
      return selectedOS.selected?.length === 0 || selectedOS.selected?.includes(getOSName(obj));
    },
    items: Object.values(OS_NAME_LABELS).map((osName) => ({
      id: osName,
      title: osName,
    })),
  };
};
const useNodesFilter = (vmiMapper: VmiMapper): RowFilter => {
  const sortedNodeNamesItems = useMemo(() => {
    return Object.values(vmiMapper?.nodeNames).sort((a, b) =>
      a?.id?.localeCompare(b?.id, undefined, {
        numeric: true,
        sensitivity: 'base',
      }),
    );
  }, [vmiMapper]);

  return {
    filterGroupName: 'Node',
    type: 'node',
    reducer: (obj) =>
      vmiMapper?.mapper?.[obj?.metadata?.namespace]?.[obj?.metadata?.name]?.status?.nodeName,
    filter: (selectedNodes, obj) => {
      const nodeName =
        vmiMapper?.mapper?.[obj?.metadata?.namespace]?.[obj?.metadata?.name]?.status?.nodeName;
      return selectedNodes.selected?.length === 0 || selectedNodes.selected?.includes(nodeName);
    },
    items: sortedNodeNamesItems,
  };
};

export const useVMListFilters = (
  vmis: V1VirtualMachineInstance[],
  vms: V1VirtualMachine[],
  vmims: V1VirtualMachineInstanceMigration[],
): { filters: RowFilter<V1VirtualMachine>[]; vmiMapper: VmiMapper; vmimMapper: VmimMapper } => {
  const vmiMapper: VmiMapper = useMemo(() => {
    return vmis?.reduce(
      (acc, vmi) => {
        const name = vmi?.metadata?.name;
        const namespace = vmi?.metadata?.namespace;
        if (!acc.mapper[namespace]) {
          acc.mapper[namespace] = {};
        }
        acc.mapper[namespace][name] = vmi;
        const nodeName = vmi?.status?.nodeName;
        if (nodeName && !acc?.nodeNames?.[nodeName]) {
          acc.nodeNames[nodeName] = {
            id: nodeName,
            title: nodeName,
          };
        }
        return acc;
      },
      { mapper: {}, nodeNames: {} },
    );
  }, [vmis]);

  const vmimMapper: VmimMapper = useMemo(() => {
    return vmims?.reduce((acc, vmim) => {
      const name = vmim?.spec?.vmiName;
      const namespace = vmim?.metadata?.namespace;
      if (!acc[namespace]) {
        acc[namespace] = {};
      }

      acc[namespace][name] = vmim;

      return acc;
    }, {});
  }, [vmims]);

  const statusFilter = useStatusFilter();
  const templatesFilter = useTemplatesFilter(vms);
  const osFilters = useOSFilter();
  const nodesFilter = useNodesFilter(vmiMapper);

  return {
    filters: [statusFilter, templatesFilter, osFilters, nodesFilter],
    vmiMapper,
    vmimMapper,
  };
};
