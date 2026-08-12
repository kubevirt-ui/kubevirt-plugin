/* eslint-disable @typescript-eslint/no-unsafe-assignment -- topology resource data */
import { modelToRef, type V1Template } from '@kubevirt-ui-ext/kubevirt-api/console';
import { VirtualMachineModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import {
  type V1VirtualMachine,
  type V1VirtualMachineInstance,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { getAnnotations, getLabels, getName, getVMStatus } from '@kubevirt-utils/resources/shared';
import { VM_TEMPLATE_ANNOTATION } from '@kubevirt-utils/resources/vm';
import { type K8sResourceKind } from '@openshift-console/dynamic-plugin-sdk';
import {
  type OverviewItem,
  type TopologyDataObject,
  type TopologyDataResources,
} from '@openshift-console/dynamic-plugin-sdk/lib/extensions/topology-types';
import {
  getTopologyEdgeItems,
  getTopologyGroupItems,
  getTopologyNodeItem,
  mergeGroup,
} from '@openshift-console/dynamic-plugin-sdk-internal';
import { type Model, NodeShape } from '@patternfly/react-topology';

import { getKubevirtModelAvailableAPIVersion } from '../../cdi-upload-provider/utils/selectors';
import { VIRTUAL_MACHINE_TYPE, WORKLOAD_TYPES } from './constants';
import { getImageForIconClass } from './icon-image-utils/catalog-item-icon';
import { type VMNodeData } from './types/types';
import { WorkloadModelProps } from './utils';

export const getOperatingSystemImage = (vm: V1VirtualMachine, templates: V1Template[]): string => {
  const templateName = getLabels(vm)?.[VM_TEMPLATE_ANNOTATION];
  const template = templateName && templates?.find((t) => getName(t) === templateName);

  return template ? getImageForIconClass(getAnnotations(template).iconClass) : '';
};

export const createVMOverviewItem = (vm: K8sResourceKind): OverviewItem => {
  vm.apiVersion ??= getKubevirtModelAvailableAPIVersion(VirtualMachineModel);
  vm.kind ??= VirtualMachineModel.kind;

  return {
    isMonitorable: false,
    isOperatorBackedService: false,
    obj: vm,
  };
};

const createTopologyVMNodeData = (
  vm: V1VirtualMachine,
  vmOverview: OverviewItem,
  resources: TopologyDataResources,
): TopologyDataObject<VMNodeData> => {
  const { labels, name, uid } = vm.metadata;

  const vmis = resources?.virtualmachineinstances?.data;
  const vmi = vmis?.find((instance) => getName(instance) === name) as V1VirtualMachineInstance;
  const templates = resources?.virtualmachinetemplates?.data as V1Template[];

  const vmStatus = getVMStatus(vm);

  return {
    data: {
      kind: modelToRef(VirtualMachineModel),
      osImage: getOperatingSystemImage(vm, templates),
      vmi,
      vmStatus,
    },
    id: uid,
    name: name || labels['app.kubernetes.io/instance'],
    resource: vm,
    resources: vmOverview,
    type: VIRTUAL_MACHINE_TYPE,
  };
};

export const getKubevirtTopologyDataModel = (
  _namespace: string,
  resources: TopologyDataResources,
): Promise<Model> => {
  const vmsDataModel: Model = { edges: [], nodes: [] };

  if (resources?.virtualmachines?.data.length) {
    const vms = resources?.virtualmachines?.data as V1VirtualMachine[];
    if (vms)
      for (const vm of vms) {
        const vmOverview = createVMOverviewItem(vm);
        const data = createTopologyVMNodeData(vm, vmOverview, resources);
        vmsDataModel?.nodes.push(
          getTopologyNodeItem(
            vm,
            VIRTUAL_MACHINE_TYPE,
            data,
            WorkloadModelProps,
            undefined,
            undefined,
            NodeShape.rect,
          ),
        );
        vmsDataModel.edges.push(...getTopologyEdgeItems(vm, resources?.virtualmachines?.data));
        for (const workload of WORKLOAD_TYPES) {
          vmsDataModel.edges.push(...getTopologyEdgeItems(vm, resources[workload]?.data)); // create visual connector from all WORKLOAD_TYPES to VMs
        }
        mergeGroup(getTopologyGroupItems(vm), vmsDataModel.nodes);
      }

    for (const resource of WORKLOAD_TYPES) {
      for (const resourceItem of resources[resource]?.data ?? []) {
        vmsDataModel.edges.push(
          ...getTopologyEdgeItems(resourceItem, resources?.virtualmachines?.data),
        ); // create visual connector from VMs to all WORKLOAD_TYPES
      }
    }
  }

  return Promise.resolve(vmsDataModel);
};
