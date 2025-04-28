import { useCallback, useMemo } from 'react';

import {
  V1VirtualMachine,
  V1VirtualMachineInstance,
  V1VirtualMachineInstanceMigration,
} from '@kubevirt-ui/kubevirt-api/kubevirt';
import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useSingleNodeCluster from '@kubevirt-utils/hooks/useSingleNodeCluster';
import { getInstanceTypePrefix } from '@kubevirt-utils/resources/bootableresources/helpers';
import { getAnnotation, getName, getNamespace } from '@kubevirt-utils/resources/shared';
import {
  ANNOTATIONS,
  LABEL_USED_TEMPLATE_NAME,
  OS_NAME_LABELS,
} from '@kubevirt-utils/resources/template';
import {
  getOperatingSystem,
  getOperatingSystemName,
} from '@kubevirt-utils/resources/vm/utils/operation-system/operationSystem';
import { getVMIIPAddresses } from '@kubevirt-utils/resources/vmi';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { RowFilter } from '@openshift-console/dynamic-plugin-sdk';

import { getVirtualMachineStorageClasses, PVCMapper, VMIMapper, VMIMMapper } from './mappers';
import { compareCIDR, getLatestMigrationForEachVM, isLiveMigratable } from './utils';
import { isErrorPrintableStatus, printableVMStatus } from './virtualMachineStatuses';

const ErrorStatus = { id: 'Error', title: 'Error' };

const statusFilterItems = [
  ...Object.keys(printableVMStatus).map((status) => ({
    id: status,
    title: status,
  })),
  ErrorStatus,
];

const useStatusFilter = (): RowFilter => ({
  filter: (statuses, obj) => {
    const status = obj?.status?.printableStatus;
    const isError = statuses.selected.includes(ErrorStatus.id) && isErrorPrintableStatus(status);

    return statuses.selected?.length === 0 || statuses.selected?.includes(status) || isError;
  },
  filterGroupName: t('Status'),
  isMatch: (obj, filterStatus) => {
    return (
      filterStatus === obj?.status?.printableStatus ||
      (filterStatus === ErrorStatus.id && isErrorPrintableStatus(obj?.status?.printableStatus))
    );
  },
  items: statusFilterItems,
  type: 'status',
});

const useLiveMigratableFilter = (): RowFilter => {
  const [isSingleNodeCluster] = useSingleNodeCluster();

  return {
    filter: (selectedItems, obj) => {
      const isMigratable = isLiveMigratable(obj, isSingleNodeCluster);
      return (
        selectedItems?.selected?.length === 0 ||
        (selectedItems?.selected?.includes('migratable') && isMigratable) ||
        (selectedItems?.selected?.includes('notMigratable') && !isMigratable)
      );
    },
    filterGroupName: t('Live migratable'),
    items: [
      { id: 'migratable', title: t('Migratable') },
      { id: 'notMigratable', title: t('Not migratable') },
    ],
    reducer: (obj) => (isLiveMigratable(obj, isSingleNodeCluster) ? 'migratable' : 'notMigratable'),
    type: 'live-migratable',
  };
};

const useTemplatesFilter = (vms: V1VirtualMachine[]): RowFilter => {
  const noTemplate = t('None');
  const templates = useMemo(
    () =>
      [
        ...new Set(
          (Array.isArray(vms) ? vms : [])?.map((vm) => {
            const templateName = vm.metadata?.labels?.[LABEL_USED_TEMPLATE_NAME];
            return templateName ?? noTemplate;
          }),
        ),
      ].map((template) => ({ id: template, title: template })),
    [vms, noTemplate],
  );

  return {
    filter: (selectedTemplates, obj) => {
      const templateName = obj?.metadata?.labels?.[LABEL_USED_TEMPLATE_NAME] ?? noTemplate;
      return (
        selectedTemplates.selected?.length === 0 ||
        selectedTemplates.selected?.includes(templateName)
      );
    },
    filterGroupName: t('Template'),
    items: templates,
    reducer: (obj) => obj?.metadata?.labels?.[LABEL_USED_TEMPLATE_NAME] ?? noTemplate,
    type: 'template',
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
    filter: (selectedOS, obj) => {
      return selectedOS.selected?.length === 0 || selectedOS.selected?.includes(getOSName(obj));
    },
    filterGroupName: t('Operating system'),
    items: Object.values(OS_NAME_LABELS).map((osName) => ({
      id: osName,
      title: osName,
    })),
    reducer: getOSName,
    type: 'os',
  };
};

const useNodesFilter = (vmiMapper: VMIMapper): RowFilter => {
  const sortedNodeNamesItems = useMemo(() => {
    return Object.values(vmiMapper?.nodeNames).sort((a, b) =>
      a?.id?.localeCompare(b?.id, undefined, {
        numeric: true,
        sensitivity: 'base',
      }),
    );
  }, [vmiMapper]);

  return {
    filter: (selectedNodes, obj) => {
      const nodeName =
        vmiMapper?.mapper?.[obj?.metadata?.namespace]?.[obj?.metadata?.name]?.status?.nodeName;
      return selectedNodes.selected?.length === 0 || selectedNodes.selected?.includes(nodeName);
    },
    filterGroupName: 'Node',
    items: sortedNodeNamesItems,
    reducer: (obj) =>
      vmiMapper?.mapper?.[obj?.metadata?.namespace]?.[obj?.metadata?.name]?.status?.nodeName,
    type: 'node',
  };
};
const useInstanceTypesFilter = (vms: V1VirtualMachine[]): RowFilter => {
  const noInstanceType = t('No InstanceType');
  const instanceTypes = useMemo(
    () =>
      [
        ...new Set(
          (Array.isArray(vms) ? vms : [])?.map((vm) => {
            const instanceTypeName = getInstanceTypePrefix(vm?.spec?.instancetype?.name);
            return instanceTypeName ?? noInstanceType;
          }),
        ),
      ].map((instanceType) => ({ id: instanceType, title: instanceType })),
    [vms, noInstanceType],
  );

  return {
    filter: (selectedInstanceTypes, obj) => {
      const instanceTypeName = getInstanceTypePrefix(obj?.spec?.instancetype?.name);
      return (
        selectedInstanceTypes.selected?.length === 0 ||
        selectedInstanceTypes.selected?.includes(instanceTypeName || noInstanceType)
      );
    },
    filterGroupName: t('InstanceType'),
    items: instanceTypes,
    reducer: (obj) => {
      const instanceTypeName = getInstanceTypePrefix(obj?.spec?.instancetype?.name);
      return instanceTypeName ?? noInstanceType;
    },
    type: 'instanceType',
  };
};

const useIPSearchFilter = (vmiMapper: VMIMapper): RowFilter => ({
  filter: (input, obj) => {
    const search = input.selected?.[0];

    if (!search) return true;

    const vmi = vmiMapper.mapper?.[obj?.metadata?.namespace]?.[obj?.metadata?.name];

    const ipAddresses = getVMIIPAddresses(vmi);

    if (search.includes('/')) {
      return ipAddresses.some((ipAddress) => compareCIDR(search, ipAddress));
    }

    return ipAddresses.some((ipAddress) => ipAddress?.includes(search));
  },
  filterGroupName: t('IP Address'),
  isMatch: () => true,
  items: [],
  type: 'ip',
});

type StorageClassByVM = { [namespace in string]: { [name in string]: Set<string> } };

const useStorageclassFilter = (vms: V1VirtualMachine[], pvcMapper: PVCMapper): RowFilter => {
  const { allStorageClasses, storageClassesByVM } = vms.reduce(
    (acc, vm) => {
      const vmNamespace = getNamespace(vm);
      const vmName = getName(vm);

      const storageClasses = getVirtualMachineStorageClasses(vm, pvcMapper);

      storageClasses.forEach((storageClass) => {
        acc.allStorageClasses.add(storageClass);
        if (isEmpty(acc.storageClassesByVM[vmNamespace])) acc.storageClassesByVM[vmNamespace] = {};

        if (isEmpty(acc.storageClassesByVM[vmNamespace][vmName]))
          acc.storageClassesByVM[vmNamespace][vmName] = new Set<string>();

        acc.storageClassesByVM[vmNamespace][vmName].add(storageClass);
      });
      return acc;
    },
    {
      allStorageClasses: new Set<string>(),
      storageClassesByVM: {} as StorageClassByVM,
    },
  );

  return {
    filter: (input, obj) => {
      const selectedStorageClasses = input.selected;

      if (isEmpty(selectedStorageClasses)) return true;

      return selectedStorageClasses.some((selectedStorageClass) =>
        storageClassesByVM?.[getNamespace(obj)]?.[getName(obj)]?.has(selectedStorageClass),
      );
    },
    filterGroupName: t('Storage class'),
    isMatch: (obj, id) => storageClassesByVM?.[getNamespace(obj)]?.[getName(obj)]?.has(id),
    items:
      Array.from(allStorageClasses)?.map((storageClassName) => ({
        id: storageClassName,
        title: storageClassName,
      })) || [],
    type: 'storageclassname',
  };
};

export const useVMListFilters = (
  vmis: V1VirtualMachineInstance[],
  vms: V1VirtualMachine[],
  vmims: V1VirtualMachineInstanceMigration[],
  pvcMapper: PVCMapper,
): {
  filters: RowFilter<V1VirtualMachine>[];
  searchFilters: RowFilter<V1VirtualMachine>[];
  vmiMapper: VMIMapper;
  vmimMapper: VMIMMapper;
} => {
  const vmiMapper: VMIMapper = useMemo(() => {
    return (Array.isArray(vmis) ? vmis : [])?.reduce(
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

  const vmimMapper: VMIMMapper = useMemo(() => getLatestMigrationForEachVM(vmims), [vmims]);

  const statusFilter = useStatusFilter();
  const templatesFilter = useTemplatesFilter(vms);
  const osFilters = useOSFilter();
  const nodesFilter = useNodesFilter(vmiMapper);
  const liveMigratableFilter = useLiveMigratableFilter();
  const instanceTypesFilter = useInstanceTypesFilter(vms);
  const searchByIP = useIPSearchFilter(vmiMapper);
  const storageClassFilters = useStorageclassFilter(vms, pvcMapper);

  return {
    filters: [
      statusFilter,
      templatesFilter,
      osFilters,
      liveMigratableFilter,
      nodesFilter,
      instanceTypesFilter,
      storageClassFilters,
    ],
    searchFilters: [searchByIP],
    vmiMapper,
    vmimMapper,
  };
};
