import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { STATIC_SEARCH_FILTERS } from '@kubevirt-utils/components/ListPageFilter/constants';
import { SINGLE_CLUSTER_KEY } from '@kubevirt-utils/resources/constants';
import { getLabel, getName, getNamespace, isFolderLabel } from '@kubevirt-utils/resources/shared';
import { getCluster } from '@multicluster/helpers/selectors';

import { VM_FOLDER_LABEL } from '../utils/constants';
import { vmsSignal } from '../utils/signals';

export const getVMFromElementID = (elementID: string): V1VirtualMachine => {
  const [cluster, namespace, name] = elementID.split('/');

  return vmsSignal?.value?.find(
    (resource) =>
      getNamespace(resource) === namespace &&
      getName(resource) === name &&
      (getCluster(resource) === cluster || cluster === SINGLE_CLUSTER_KEY),
  );
};

export const isVMAloneInFolder = (draggingVM: V1VirtualMachine) => {
  const draggingVMFolder = getLabel(draggingVM, VM_FOLDER_LABEL);

  return (
    vmsSignal?.value?.filter((vm) => draggingVMFolder === getLabel(vm, VM_FOLDER_LABEL)).length ===
    1
  );
};

export const appendFolderLabelParam = (href: string, folderName: string): string => {
  const [pathname, search] = href.split('?');
  const params = new URLSearchParams(search ?? '');

  const nonFolderLabels = params
    .getAll(STATIC_SEARCH_FILTERS.labels)
    .filter((value) => !isFolderLabel(value));

  params.delete(STATIC_SEARCH_FILTERS.labels);
  nonFolderLabels.forEach((label) => params.append(STATIC_SEARCH_FILTERS.labels, label));
  params.append(STATIC_SEARCH_FILTERS.labels, `${VM_FOLDER_LABEL}=${folderName}`);

  return `${pathname}?${params.toString()}`;
};
