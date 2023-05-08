import { getKubevirtModelAvailableAPIVersion } from 'src/views/cdi-upload-provider/utils/selectors';
import { K8sResourceKind } from 'src/views/clusteroverview/utils/types';
import { VMIKind, VMImportKind, VMKind } from 'src/views/topology/utils/types/kubevirtTypes';

import { getImageForIconClass } from '@console/internal/components/catalog/catalog-item-icon';
import VirtualMachineModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineModel';
import { V1beta1DataVolume } from '@kubevirt-ui/kubevirt-api/containerized-data-importer/models';
import { getVMStatus } from '@kubevirt-utils/resources/shared';
import { LABEL_USED_TEMPLATE_NAME } from '@kubevirt-utils/resources/template';
import { PersistentVolumeClaimKind } from '@kubevirt-utils/types/k8sTypes';
import {
  OverviewItem,
  TopologyDataObject,
  TopologyDataResources,
} from '@openshift-console/dynamic-plugin-sdk/lib/extensions/topology-types';
import { Model, NodeShape } from '@patternfly/react-topology/dist/esm/types';

import {
  getTopologyEdgeItems,
  getTopologyGroupItems,
  getTopologyNodeItem,
  mergeGroup,
  WorkloadModelProps,
} from '../../../views/topology/data-transforms/transform-utils';
import { PodKind } from '../../../views/topology/utils/types/podTypes';

import { TYPE_VIRTUAL_MACHINE } from './components/const';
import { VMNodeData } from './types';

export const getOperatingSystemImage = (vm: VMKind, templates: K8sResourceKind[]): string => {
  const templateName = vm.metadata?.labels?.[LABEL_USED_TEMPLATE_NAME];
  const template = templateName && templates.find((t) => t.metadata.name === templateName);
  if (!template) {
    return '';
  }

  return getImageForIconClass(template.metadata.annotations.iconClass);
};

export const createVMOverviewItem = (vm: K8sResourceKind): OverviewItem => {
  if (!vm.apiVersion) {
    vm.apiVersion = getKubevirtModelAvailableAPIVersion(VirtualMachineModel);
  }
  if (!vm.kind) {
    vm.kind = VirtualMachineModel.kind;
  }

  return {
    obj: vm,
    isMonitorable: false,
    isOperatorBackedService: false,
  };
};

const createTopologyVMNodeData = (
  resource: K8sResourceKind,
  vmOverview: OverviewItem,
  resources: TopologyDataResources,
): TopologyDataObject<VMNodeData> => {
  const { uid, name, labels } = resource.metadata;
  const vmis = resources.virtualmachineinstances?.data;
  const vmi = vmis.find((instance) => instance.metadata.name === name) as VMIKind;
  const pods = resources.pods?.data as PodKind[];
  const migrations = resources.migrations?.data;
  const pvcs = resources.pvcs?.data as PersistentVolumeClaimKind[];
  const dataVolumes = resources.dataVolumes?.data as V1beta1DataVolume[];
  const vmImports = resources.vmImports?.data as VMImportKind[];

  const vmStatusBundle = getVMStatus({
    vm: resource as VMKind,
    vmi,
    pods,
    migrations,
    pvcs,
    dataVolumes,
    vmImports,
  });

  return {
    id: uid,
    name: name || labels['app.kubernetes.io/instance'],
    type: TYPE_VIRTUAL_MACHINE,
    resource,
    resources: vmOverview,
    data: {
      kind: referenceFor(resource),
      vmi,
      vmStatusBundle,
      osImage: getOperatingSystemImage(resource as VMKind, resources.virtualmachinetemplates.data),
    },
  };
};

export const getKubevirtTopologyDataModel = (
  namespace: string,
  resources: TopologyDataResources,
): Promise<Model> => {
  const vmsDataModel: Model = { nodes: [], edges: [] };
  const vmsResources = [];

  if (resources.virtualmachines?.data.length) {
    resources.virtualmachines.data.forEach((resource) => {
      const vmOverview = createVMOverviewItem(resource);
      const { uid } = resource.metadata;
      vmsResources.push(uid);
      const data = createTopologyVMNodeData(resource, vmOverview, resources);
      vmsDataModel.nodes.push(
        getTopologyNodeItem(
          resource,
          TYPE_VIRTUAL_MACHINE,
          data,
          WorkloadModelProps,
          undefined,
          undefined,
          NodeShape.rect,
        ),
      );
      vmsDataModel.edges.push(...getTopologyEdgeItems(resource, resources.virtualmachines.data));
      mergeGroup(getTopologyGroupItems(resource), vmsDataModel.nodes);
    });
  }

  return Promise.resolve(vmsDataModel);
};
